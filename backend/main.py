from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import pandas as pd
import sys
import os
from pathlib import Path
import json
import io

sys.path.append(str(Path(__file__).parent.parent / 'ml_models'))

from ml_engine import FinancialDistressPredictor
from recommendation_engine import RecommendationEngine, calculate_national_averages
from report_generator import FinancialReportGenerator

app = FastAPI(
    title="Financial Distress Predictor API",
    description="AI-powered financial health assessment and recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None
recommendation_engine = None
report_generator = None
national_averages = None

class HouseholdInput(BaseModel):
    Net_Income: float = Field(..., ge=0, description="Monthly net income")
    Food: float = Field(..., ge=0, description="Food expenses")
    Housing: float = Field(..., ge=0, description="Housing expenses")
    Transport: float = Field(..., ge=0, description="Transport expenses")
    Health: float = Field(..., ge=0, description="Health expenses")
    Education: float = Field(..., ge=0, description="Education expenses")
    Recreation: float = Field(..., ge=0, description="Recreation expenses")
    Clothing: float = Field(..., ge=0, description="Clothing expenses")
    Communication: float = Field(..., ge=0, description="Communication expenses")
    Restaurants: float = Field(..., ge=0, description="Restaurant/dining expenses")
    Miscellaneous: float = Field(..., ge=0, description="Miscellaneous expenses")
    
    Region: Optional[str] = Field("Central Hungary", description="Geographic region")
    Household_Type: Optional[str] = Field("Family with children", description="Household type")
    Household_Size: Optional[int] = Field(4, ge=1, le=10, description="Number of household members")
    Employment_Status: Optional[str] = Field("Employed", description="Employment status")

class RiskFactor(BaseModel):
    factor: str
    value: float
    threshold: str
    explanation: str
    contribution_score: float

class ExecutiveSummary(BaseModel):
    status: str
    primary_cause: str
    urgent_action: str
    recovery_horizon: str

class HealthScoreBreakdown(BaseModel):
    income_stability: float = Field(..., ge=0, le=100)
    expense_control: float = Field(..., ge=0, le=100)
    debt_pressure: float = Field(..., ge=0, le=100)
    savings_discipline: float = Field(..., ge=0, le=100)

class GoalInput(BaseModel):
    goal_name: str
    goal_amount: float = Field(..., gt=0)
    duration_months: int = Field(..., gt=0, le=360)
    priority: Optional[str] = "Medium"

class GoalAnalysis(BaseModel):
    feasibility: str
    required_monthly: float
    available_surplus: float
    gap: float
    distress_impact_pct: float
    suggestions: List[str]

class SimulationDelta(BaseModel):
    health_score_delta: float
    component_deltas: Dict[str, float]
    trajectory_change: str
    probability_shift: Dict[str, float]

class HouseholdWithGoal(BaseModel):
    Net_Income: float = Field(..., ge=0, description="Monthly net income")
    Food: float = Field(..., ge=0)
    Housing: float = Field(..., ge=0)
    Transport: float = Field(..., ge=0)
    Health: float = Field(..., ge=0)
    Education: float = Field(..., ge=0)
    Recreation: float = Field(..., ge=0)
    Clothing: float = Field(..., ge=0)
    Communication: float = Field(..., ge=0)
    Restaurants: float = Field(..., ge=0)
    Miscellaneous: float = Field(..., ge=0)
    
    goal: GoalInput

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    
    health_score: float = Field(..., ge=0, le=100, description="0-100 Financial Health Score")
    executive_summary: ExecutiveSummary
    risk_factors: List[RiskFactor]
    risk_explanation_text: List[str]
    
    recommendations: List[Dict]
    shap_plot: Optional[str] = None
    financial_metrics: Dict
    
    recovery_timeline_months: int
    monthly_savings_needed: float
    
    health_breakdown: HealthScoreBreakdown

class EDAResponse(BaseModel):
    summary_stats: Dict
    category_breakdown: List[Dict]
    risk_distribution: Dict
    regional_analysis: Optional[List[Dict]]

@app.on_event("startup")
async def startup_event():
    global predictor, recommendation_engine, report_generator, national_averages
    
    print("🚀 Starting Financial Distress Predictor API...")
    
    predictor = FinancialDistressPredictor(model_dir='../ml_models')
    
    try:
        predictor.load_model()
        print("ML Model loaded successfully")
    except FileNotFoundError:
        print("No trained model found. Please train the model first.")
    
    recommendation_engine = RecommendationEngine()
    print("Recommendation Engine initialized")
    
    report_generator = FinancialReportGenerator()
    print("Report Generator initialized")
    
    try:
        df = pd.read_csv('../data/processed/household_budget_processed.csv')
        national_averages = calculate_national_averages(df)
        print("National averages calculated")
    except FileNotFoundError:
        print("Processed data not found. National averages unavailable.")
        national_averages = {}

@app.get("/")
async def root():
    return {
        "message": "Financial Distress Predictor API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "predict": "/predict",
            "analyze_eda": "/analyze_eda",
            "generate_report": "/generate_report",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor is not None and predictor.model is not None,
        "services": {
            "predictor": predictor is not None,
            "recommendations": recommendation_engine is not None,
            "reports": report_generator is not None
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_financial_distress(household: HouseholdInput):
    if predictor is None or predictor.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        user_data = household.dict()
        
        total_exp = sum([
            user_data['Food'], user_data['Housing'], user_data['Transport'],
            user_data['Health'], user_data['Education'], user_data['Recreation'],
            user_data['Clothing'], user_data['Communication'], user_data['Restaurants'],
            user_data['Miscellaneous']
        ])
        
        user_data['Total_Expenditure'] = total_exp
        user_data['Savings'] = user_data['Net_Income'] - total_exp
        user_data['Expenditure_to_Income_Ratio'] = total_exp / user_data['Net_Income']
        user_data['Savings_Rate'] = user_data['Savings'] / user_data['Net_Income']
        user_data['Housing_to_Income_Ratio'] = user_data['Housing'] / user_data['Net_Income']
        user_data['Food_to_Total_Exp_Ratio'] = user_data['Food'] / total_exp if total_exp > 0 else 0
        user_data['Transport_to_Income_Ratio'] = user_data['Transport'] / user_data['Net_Income']
        
        user_data['Essential_Spending'] = user_data['Food'] + user_data['Housing']
        user_data['Essential_Spending_Share'] = user_data['Essential_Spending'] / total_exp if total_exp > 0 else 0
        
        user_data['Discretionary_Spending'] = (user_data['Recreation'] + 
                                               user_data['Restaurants'] + 
                                               user_data['Clothing'])
        user_data['Discretionary_Spending_Share'] = user_data['Discretionary_Spending'] / total_exp if total_exp > 0 else 0
        
        user_data['Per_Capita_Income'] = user_data['Net_Income'] / user_data['Household_Size']
        user_data['Per_Capita_Expenditure'] = total_exp / user_data['Household_Size']
        
        spending_values = [
            user_data['Food'], user_data['Housing'], user_data['Transport'],
            user_data['Health'], user_data['Education'], user_data['Recreation'],
            user_data['Clothing'], user_data['Communication'], user_data['Restaurants'],
            user_data['Miscellaneous']
        ]
        user_data['Spending_Variance'] = pd.Series(spending_values).var()
        user_data['Spending_Std'] = pd.Series(spending_values).std()
        user_data['Spending_CV'] = user_data['Spending_Std'] / total_exp if total_exp > 0 else 0
        
        user_data['Health_Spending_Ratio'] = user_data['Health'] / user_data['Net_Income']
        user_data['Education_Spending_Ratio'] = user_data['Education'] / user_data['Net_Income']
        
        months_of_savings = user_data['Savings'] / (total_exp / 12) if total_exp > 0 else 0
        user_data['Months_of_Savings'] = months_of_savings if months_of_savings != float('inf') else 0
        
        user_data['Is_Overspending'] = 1 if total_exp > user_data['Net_Income'] else 0
        user_data['High_Housing_Burden'] = 1 if user_data['Housing_to_Income_Ratio'] > 0.35 else 0
        user_data['Low_Savings'] = 1 if user_data['Savings_Rate'] < 0.10 else 0
        
        housing_defaults = {
            'Unnamed: 0': 0,
            'Head_Sex': 'Male',
            'Head_Age': 40,
            'Household Head Marital Status': 'Married',
            'Household Head Highest Grade Completed': 'High School Graduate',
            'Household Head Occupation': 'Unknown',
            'Household Head Class of Worker': 'Employed',
            'Members with age less than 5 year old': 0,
            'Members with age 5 - 17 years old': 0,
            'Total number of family members employed': 1,
            'Bread and Cereals Expenditure': user_data['Food'] * 0.5,
            'Total Rice Expenditure': user_data['Food'] * 0.4,
            'Meat Expenditure': user_data['Food'] * 0.2,
            'Total Fish and  marine products Expenditure': user_data['Food'] * 0.15,
            'Fruit Expenditure': user_data['Food'] * 0.05,
            'Vegetables Expenditure': user_data['Food'] * 0.1,
            'Alcoholic Beverages Expenditure': 0,
            'Tobacco Expenditure': 0,
            'Special_Occasions': user_data['Recreation'],
            'Main Source of Income': 'Wage/Salaries',
            'Number of Airconditioner': 0,
            'Electricity': 1,
            'House Age': 15,
            'Number of bedrooms': 2,
            'Number of Personal Computer': 1,
            'Total Income from Entrepreneurial Acitivites': 0,
            'Number of Component/Stereo set': 0,
            'Type of Roof': 'Strong material(galvanized,iron,al,tile,concrete,brick,stone,asbestos)',
            'Number of Washing Machine': 1,
            'Number of Motorized Banca': 0,
            'Number of Cellular phone': 2,
            'Number of Television': 1,
            'Imputed House Rental Value': user_data['Housing'] * 0.5,
            'Toilet Facilities': 'Water-sealed, sewer septic tank, used exclusively by household',
            'Type of Walls': 'Strong',
            'House Floor Area': 50,
            'Agricultural Household indicator': 0,
            'Type of Building/House': 'Single house',
            'Number of Stove with Oven/Gas Range': 1,
            'Number of Refrigerator/Freezer': 1,
            'Number of Car, Jeep, Van': 0,
            'Number of Landline/wireless telephones': 0,
            'Number of Motorcycle/Tricycle': 0,
            'Crop Farming and Gardening expenses': 0,
            'Main Source of Water Supply': 'Own use, faucet, community water system',
            'Tenure Status': 'Own or owner-like possession of house and lot',
            'Number of CD/VCD/DVD': 0
        }
        
        user_data.update(housing_defaults)
        
        df_user = pd.DataFrame([user_data])
        
        prediction_result = predictor.predict(df_user)
        
        recommendations = recommendation_engine.generate_recommendations(
            user_data, prediction_result
        )
        
        shap_plot = None
        try:
            shap_plot = predictor.get_shap_explanation(df_user, return_base64=True)
        except Exception as e:
            print(f"SHAP generation skipped: {e}")
        
        financial_metrics = {
            'total_expenditure': round(total_exp, 2),
            'savings': round(user_data['Savings'], 2),
            'savings_rate_pct': round(user_data['Savings_Rate'] * 100, 2),
            'expenditure_to_income_pct': round(user_data['Expenditure_to_Income_Ratio'] * 100, 2),
            'housing_burden_pct': round(user_data['Housing_to_Income_Ratio'] * 100, 2),
            'essential_spending_pct': round(user_data['Essential_Spending_Share'] * 100, 2),
            'discretionary_spending_pct': round(user_data['Discretionary_Spending_Share'] * 100, 2)
        }
        
        prob_high = prediction_result['probabilities'].get('High', 0)
        prob_medium = prediction_result['probabilities'].get('Medium', 0)
        prob_low = prediction_result['probabilities'].get('Low', 0)
        
        risk_penalty = (prob_high * 100) + (prob_medium * 50)
        health_score = max(0, min(100, 100 - risk_penalty))
        
        risk_factors = []
        
        if user_data['Housing_to_Income_Ratio'] > 0.35:
            risk_factors.append({
                'factor': 'Housing Cost Ratio',
                'value': round(user_data['Housing_to_Income_Ratio'] * 100, 1),
                'threshold': '>35%',
                'explanation': f"Housing consumes {round(user_data['Housing_to_Income_Ratio'] * 100)}% of income, leaving little for savings.",
                'contribution_score': 0.8
            })
            
        if user_data['Expenditure_to_Income_Ratio'] > 1.0:
            risk_factors.append({
                'factor': 'Expense to Income Ratio',
                'value': round(user_data['Expenditure_to_Income_Ratio'], 2),
                'threshold': '>1.0',
                'explanation': f"You spend {round(user_data['Expenditure_to_Income_Ratio'], 2)} for every 1.0 earned.",
                'contribution_score': 0.95
            })
        elif user_data['Expenditure_to_Income_Ratio'] > 0.9:
            risk_factors.append({
                'factor': 'Expense to Income Ratio',
                'value': round(user_data['Expenditure_to_Income_Ratio'], 2),
                'threshold': '>0.9',
                'explanation': "Expenses are dangerously close to income limit.",
                'contribution_score': 0.6
            })
            
        if user_data['Savings_Rate'] < 0.05:
            risk_factors.append({
                'factor': 'Savings Rate',
                'value': round(user_data['Savings_Rate'] * 100, 1),
                'threshold': '<5%',
                'explanation': "Savings buffer is critically low.",
                'contribution_score': 0.7
            })
        
        risk_factors_models = [RiskFactor(**rf) for rf in risk_factors]
        
        primary_cause = "Balanced financial execution"
        urgent_action = "Maintain current habits"
        recovery_months = 0
        monthly_savings_needed = 0
        
        if prediction_result['prediction'] == 'High':
            status = 'High Financial Risk'
            if user_data['Housing_to_Income_Ratio'] > 0.4:
                primary_cause = "Critical housing burden draining resources"
                urgent_action = "Reduce housing costs or increase income immediately"
            elif user_data['Is_Overspending']:
                primary_cause = "Monthly expenses consistently exceed income"
                urgent_action = "Immediate spending freeze on non-essentials"
            else:
                primary_cause = "Combined high fixed costs and low liquidity"
                urgent_action = "Build emergency fund aggressively"
            
            target_buffer = total_exp * 6
            current_buffer = user_data['Savings']
            shortfall = target_buffer - max(0, current_buffer)
            
            potential_monthly_savings = user_data['Net_Income'] * 0.2
            recovery_months = int(shortfall / potential_monthly_savings) if potential_monthly_savings > 0 else 24
            recovery_months = min(24, max(3, recovery_months))
            monthly_savings_needed = potential_monthly_savings

        
        elif prediction_result['prediction'] == 'Medium':
            status = 'Vulnerable'
            primary_cause = "High Discretionary Spending or Low Buffer"
            if user_data['Discretionary_Spending_Share'] > 0.3:
                 primary_cause = "High discretionary spending impacting resilience"
                 urgent_action = "Cap discretionary spending to 20%"
            else:
                 urgent_action = "Optimize utility and food costs"
            
            recovery_months = 4
            monthly_savings_needed = user_data['Net_Income'] * 0.15
            
        else:
            status = 'Healthy'
            primary_cause = "Strong income-to-expense ratio"
            urgent_action = "Invest surplus for growth"
            recovery_months = 0
        
        executive_summary = ExecutiveSummary(
            status=status,
            primary_cause=primary_cause,
            urgent_action=urgent_action,
            recovery_horizon=f"{recovery_months} - {recovery_months+3} months" if recovery_months > 0 else "Analysis Period"
        )

        
        income_stability = min(100, max(0, (user_data['Savings_Rate'] * 200) + 30))
        
        expense_control = max(0, min(100, 100 - (user_data['Expenditure_to_Income_Ratio'] * 100)))
        
        debt_pressure = max(0, min(100, 100 - (user_data['Housing_to_Income_Ratio'] * 200)))
        
        savings_discipline = min(100, max(0, user_data['Savings_Rate'] * 300))
        
        health_breakdown = HealthScoreBreakdown(
            income_stability=round(income_stability, 1),
            expense_control=round(expense_control, 1),
            debt_pressure=round(debt_pressure, 1),
            savings_discipline=round(savings_discipline, 1)
        )

        return {
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'probabilities': prediction_result['probabilities'],
            
            'health_score': round(health_score, 1),
            'executive_summary': executive_summary,
            'risk_factors': risk_factors_models,
            'risk_explanation_text': [f.explanation for f in risk_factors_models],
            'recovery_timeline_months': recovery_months,
            'monthly_savings_needed': round(monthly_savings_needed, 2),
            
            'recommendations': recommendations,
            'shap_plot': shap_plot,
            'financial_metrics': financial_metrics,
            'health_breakdown': health_breakdown
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/analyze_eda", response_model=EDAResponse)
async def analyze_eda():
    try:
        df = pd.read_csv('../data/processed/household_budget_processed.csv')
        
        summary_stats = {
            'total_households': len(df),
            'avg_income': round(df['Net_Income'].mean(), 2),
            'median_income': round(df['Net_Income'].median(), 2),
            'avg_expenditure': round(df['Total_Expenditure'].mean(), 2),
            'avg_savings': round(df['Savings'].mean(), 2),
            'avg_savings_rate': round(df['Savings_Rate'].mean() * 100, 2)
        }
        
        categories = ['Food', 'Housing', 'Transport', 'Health', 'Education', 
                     'Recreation', 'Clothing', 'Communication', 'Restaurants', 'Miscellaneous']
        
        category_breakdown = []
        for cat in categories:
            avg_amount = df[cat].mean()
            pct_of_income = (avg_amount / df['Net_Income'].mean()) * 100
            category_breakdown.append({
                'category': cat,
                'average_amount': round(avg_amount, 2),
                'percentage_of_income': round(pct_of_income, 2)
            })
        
        risk_counts = df['Financial_Distress'].value_counts().to_dict()
        risk_distribution = {
            'Low': risk_counts.get('Low', 0),
            'Medium': risk_counts.get('Medium', 0),
            'High': risk_counts.get('High', 0)
        }
        
        regional_analysis = []
        for region in df['Region'].unique():
            region_df = df[df['Region'] == region]
            regional_analysis.append({
                'region': region,
                'avg_income': round(region_df['Net_Income'].mean(), 2),
                'avg_expenditure': round(region_df['Total_Expenditure'].mean(), 2),
                'high_risk_pct': round((region_df['Financial_Distress'] == 'High').mean() * 100, 2)
            })
        
        return {
            'summary_stats': summary_stats,
            'category_breakdown': category_breakdown,
            'risk_distribution': risk_distribution,
            'regional_analysis': regional_analysis
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Processed data not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/generate_report")
async def generate_report(household: HouseholdInput, user_id: Optional[str] = "USER001"):
    if report_generator is None:
        raise HTTPException(status_code=503, detail="Report generator not initialized")
    
    try:
        prediction_response = await predict_financial_distress(household)
        
        user_data = household.dict()
        user_data['Total_Expenditure'] = prediction_response.financial_metrics['total_expenditure']
        user_data['Savings'] = prediction_response.financial_metrics['savings']
        
        pdf_path = report_generator.generate_report(
            user_id=user_id,
            user_data=user_data,
            prediction_result={
                'prediction': prediction_response.prediction,
                'confidence': prediction_response.confidence,
                'probabilities': prediction_response.probabilities
            },
            recommendations=prediction_response.recommendations,
            financial_metrics=prediction_response.financial_metrics,
            shap_plot_base64=prediction_response.shap_plot
        )
        
        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename=f'financial_report_{user_id}.pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@app.post("/analyze_goal", response_model=GoalAnalysis)
async def analyze_goal(data: HouseholdWithGoal):
    try:
        I = data.Net_Income
        
        E = sum([
            data.Food, data.Housing, data.Transport,
            data.Health, data.Education, data.Recreation,
            data.Clothing, data.Communication, data.Restaurants,
            data.Miscellaneous
        ])
        
        D = data.Housing
        
        G = data.goal.goal_amount
        T = data.goal.duration_months
        
        S_raw = I - (E + D)
        
        S_emergency = 0.10 * I
        S_safe1 = S_raw - S_emergency
        
        S_safe2 = (0.60 * I) - D
        
        S_safe = min(S_safe1, S_safe2)
        
        S_safe = max(0, S_safe)
        
        S_required = G / T
        
        T_healthy = int(G / S_safe) if S_safe > 0 else float('inf')
        
        gap = S_required - S_safe
        
        DIR_current = (I - (E + D)) / I if I > 0 else 0
        DIR_with_goal = (I - (E + D + S_required)) / I if I > 0 else 0
        
        if DIR_with_goal < 0.20:
            distress_impact = 15.0
        elif DIR_with_goal < DIR_current:
            distress_impact = abs(DIR_current - DIR_with_goal) * 50
        else:
            distress_impact = 0
        
        if S_required <= S_safe:
            feasibility = "Achievable"
            suggestions = [
                f"Goal is financially healthy. Save ${round(S_required, 0)}/month safely.",
                f"Your safe saving capacity is ${round(S_safe, 0)}/month.",
                f"This maintains emergency buffer of ${round(S_emergency, 0)}/month.",
                "Consider automating savings for consistency."
            ]
            
        elif S_safe < S_required <= S_raw:
            feasibility = "Tight"
            suggestions = [
                f"⚠️ Goal achievable but increases financial risk.",
                f"Safe saving: ${round(S_safe, 0)}/month. Required: ${round(S_required, 0)}/month.",
                f"Healthier timeline: {T_healthy} months (vs requested {T}).",
                f"Alternative: Reduce expenses by ${round(gap, 0)}/month.",
                "Or increase income to maintain health score."
            ]
            
        else:
            feasibility = "Not Feasible"
            
            if S_safe <= 0:
                suggestions = [
                    "❌ Current financial structure has no saving capacity.",
                    f"You need ${round(abs(S_raw), 0)}/month just to cover expenses.",
                    "Priority: Reduce expenses or increase income first.",
                    "Goal planning should wait until positive cash flow exists."
                ]
            else:
                suggestions = [
                    f"❌ Required ${round(S_required, 0)}/month exceeds safe capacity.",
                    f"Maximum safe saving: ${round(S_safe, 0)}/month.",
                    f"Recommended duration: {T_healthy} months (not {T}).",
                    f"Or reduce goal amount to ${round(S_safe * T, 0)} for {T} months.",
                    "Restructure debt to increase saving capacity."
                ]
        
        return GoalAnalysis(
            feasibility=feasibility,
            required_monthly=round(S_required, 2),
            available_surplus=round(S_safe, 2),
            gap=round(gap, 2),
            distress_impact_pct=round(distress_impact, 2),
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Goal analysis error: {str(e)}")

@app.post("/simulate", response_model=PredictionResponse)
async def simulate_scenario(household: HouseholdInput):
    try:
        return await predict_financial_distress(household)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
