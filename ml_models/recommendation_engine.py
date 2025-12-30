"""
Recommendation Engine: Generate actionable financial advice based on distress level
"""

import pandas as pd
import numpy as np

class RecommendationEngine:
    """Generate personalized financial recommendations."""
    
    def __init__(self):
        """Initialize recommendation rules."""
        pass
    
    def generate_recommendations(self, user_data, prediction_result):
        """
        Generate actionable recommendations based on financial distress level.
        
        Args:
            user_data: dict or DataFrame with household financial data
            prediction_result: dict with prediction, confidence, probabilities
        
        Returns:
            list of recommendation dictionaries
        """
        if isinstance(user_data, pd.DataFrame):
            user_data = user_data.iloc[0].to_dict()
        
        recommendations = []
        distress_level = prediction_result['prediction']
        
        # Calculate key ratios
        income = user_data.get('Net_Income', 0)
        total_exp = user_data.get('Total_Expenditure', 0)
        housing = user_data.get('Housing', 0)
        food = user_data.get('Food', 0)
        savings = user_data.get('Savings', 0)
        discretionary = user_data.get('Discretionary_Spending', 0)
        
        housing_ratio = housing / income if income > 0 else 0
        food_ratio = food / total_exp if total_exp > 0 else 0
        savings_rate = savings / income if income > 0 else 0
        disc_ratio = discretionary / total_exp if total_exp > 0 else 0
        
        # HIGH DISTRESS RECOMMENDATIONS
        if distress_level == 'High':
            recommendations.append({
                'category': 'Critical',
                'priority': 'High',
                'title': 'Immediate Action Required',
                'message': f'Your expenses are {(total_exp/income)*100:.1f}% of your income. Take immediate steps to reduce spending.',
                'action': 'Review all expenses and eliminate non-essentials'
            })
            
            # Housing burden
            if housing_ratio > 0.40:
                recommendations.append({
                    'category': 'Housing',
                    'priority': 'High',
                    'title': 'Housing Costs Too High',
                    'message': f'Housing is {housing_ratio*100:.1f}% of income (recommended: <35%). Consider downsizing or refinancing.',
                    'action': 'Explore lower-cost housing options or negotiate rent'
                })
            
            # Food spending
            if food_ratio > 0.30:
                recommendations.append({
                    'category': 'Food',
                    'priority': 'High',
                    'title': 'Optimize Food Spending',
                    'message': f'Food is {food_ratio*100:.1f}% of expenses. Meal planning and bulk buying can reduce costs by 20-30%.',
                    'action': 'Create weekly meal plans, use coupons, buy generic brands'
                })
            
            # Discretionary spending
            if disc_ratio > 0.15:
                recommendations.append({
                    'category': 'Lifestyle',
                    'priority': 'High',
                    'title': 'Cut Discretionary Spending',
                    'message': f'Lifestyle expenses are {disc_ratio*100:.1f}% of budget. Temporary cuts can create breathing room.',
                    'action': 'Pause subscriptions, reduce dining out, postpone non-essential purchases'
                })
            
            # Income
            recommendations.append({
                'category': 'Income',
                'priority': 'High',
                'title': 'Increase Income',
                'message': 'Consider additional income sources to improve your financial position.',
                'action': 'Explore freelancing, part-time work, or selling unused items'
            })
        
        # MEDIUM DISTRESS RECOMMENDATIONS
        elif distress_level == 'Medium':
            recommendations.append({
                'category': 'Warning',
                'priority': 'Medium',
                'title': 'Budget Optimization Needed',
                'message': f'Spending at {(total_exp/income)*100:.1f}% of income. Build a buffer to avoid financial stress.',
                'action': 'Create a detailed monthly budget and track all expenses'
            })
            
            # Housing
            if housing_ratio > 0.35:
                recommendations.append({
                    'category': 'Housing',
                    'priority': 'Medium',
                    'title': 'Housing Costs Elevated',
                    'message': f'Housing at {housing_ratio*100:.1f}% of income. Aim for <35% for better financial flexibility.',
                    'action': 'Look for ways to reduce utilities or consider roommate'
                })
            
            # Savings
            if savings_rate < 0.10:
                recommendations.append({
                    'category': 'Savings',
                    'priority': 'Medium',
                    'title': 'Build Emergency Fund',
                    'message': f'Savings rate at {savings_rate*100:.1f}%. Aim for 10-20% to build financial resilience.',
                    'action': 'Set up automatic transfers to savings account, start with 5%'
                })
            
            # Discretionary
            if disc_ratio > 0.20:
                recommendations.append({
                    'category': 'Lifestyle',
                    'priority': 'Medium',
                    'title': 'Optimize Lifestyle Spending',
                    'message': f'Discretionary spending at {disc_ratio*100:.1f}%. Small cuts can significantly improve savings.',
                    'action': 'Review subscriptions, negotiate bills, find free entertainment'
                })
            
            # General advice
            recommendations.append({
                'category': 'Planning',
                'priority': 'Medium',
                'title': 'Financial Planning',
                'message': 'Create a 3-6 month emergency fund and review your budget monthly.',
                'action': 'Use budgeting apps, set financial goals, track progress'
            })
        
        # LOW DISTRESS RECOMMENDATIONS
        else:
            recommendations.append({
                'category': 'Success',
                'priority': 'Low',
                'title': 'Healthy Financial Position',
                'message': f'Spending at {(total_exp/income)*100:.1f}% of income. Maintain good habits and optimize further.',
                'action': 'Continue current practices and look for growth opportunities'
            })
            
            # Optimize savings
            if savings_rate < 0.20:
                recommendations.append({
                    'category': 'Growth',
                    'priority': 'Low',
                    'title': 'Maximize Savings',
                    'message': f'Savings rate at {savings_rate*100:.1f}%. Increase to 20%+ for wealth building.',
                    'action': 'Consider high-yield savings, investment accounts, or retirement funds'
                })
            
            # Investment
            recommendations.append({
                'category': 'Investment',
                'priority': 'Low',
                'title': 'Consider Investing',
                'message': 'Your financial foundation is solid. Explore investment opportunities.',
                'action': 'Research index funds, retirement accounts, or real estate'
            })
            
            # Financial goals
            recommendations.append({
                'category': 'Goals',
                'priority': 'Low',
                'title': 'Set Long-term Goals',
                'message': 'Plan for major financial goals like home ownership, education, or retirement.',
                'action': 'Create a 5-year financial plan with specific milestones'
            })
            
            # Optimize existing expenses
            recommendations.append({
                'category': 'Optimization',
                'priority': 'Low',
                'title': 'Fine-tune Budget',
                'message': 'Review recurring expenses for potential savings.',
                'action': 'Negotiate insurance rates, refinance loans, optimize subscriptions'
            })
        
        # Universal recommendations
        recommendations.append({
            'category': 'Protection',
            'priority': 'Medium',
            'title': 'Financial Protection',
            'message': 'Ensure adequate insurance coverage (health, life, property).',
            'action': 'Review insurance policies annually and adjust coverage as needed'
        })
        
        return recommendations
    
    def get_benchmark_comparison(self, user_data, national_avg):
        """
        Compare user's spending to national averages.
        
        Args:
            user_data: dict with user's financial data
            national_avg: dict with national average spending patterns
        
        Returns:
            dict with comparison metrics
        """
        comparison = {}
        
        categories = ['Housing', 'Food', 'Transport', 'Health', 'Education', 
                     'Recreation', 'Clothing']
        
        for cat in categories:
            user_val = user_data.get(cat, 0)
            user_income = user_data.get('Net_Income', 1)
            user_pct = (user_val / user_income) * 100
            
            nat_pct = national_avg.get(f'{cat}_Pct', 0)
            
            comparison[cat] = {
                'user_percentage': round(user_pct, 2),
                'national_average': round(nat_pct, 2),
                'difference': round(user_pct - nat_pct, 2),
                'status': 'above' if user_pct > nat_pct else 'below'
            }
        
        return comparison

def calculate_national_averages(df):
    """Calculate national average spending patterns from dataset."""
    
    categories = ['Housing', 'Food', 'Transport', 'Health', 'Education', 
                 'Recreation', 'Clothing', 'Communication', 'Restaurants']
    
    averages = {}
    
    for cat in categories:
        avg_pct = (df[cat] / df['Net_Income']).mean() * 100
        averages[f'{cat}_Pct'] = round(avg_pct, 2)
    
    return averages

if __name__ == '__main__':
    # Test recommendation engine
    engine = RecommendationEngine()
    
    # Test case: High distress
    test_data = {
        'Net_Income': 300000,
        'Total_Expenditure': 285000,
        'Housing': 135000,
        'Food': 90000,
        'Savings': 15000,
        'Discretionary_Spending': 45000
    }
    
    test_prediction = {
        'prediction': 'High',
        'confidence': 0.92,
        'probabilities': {'Low': 0.03, 'Medium': 0.05, 'High': 0.92}
    }
    
    recommendations = engine.generate_recommendations(test_data, test_prediction)
    
    print("RECOMMENDATION ENGINE TEST")
    print("="*70)
    for rec in recommendations:
        print(f"\n{rec['title']}")
        print(f"Priority: {rec['priority']} | Category: {rec['category']}")
        print(f"Message: {rec['message']}")
        print(f"Action: {rec['action']}")
