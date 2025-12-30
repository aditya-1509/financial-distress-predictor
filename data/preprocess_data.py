"""
Data Preprocessing for Real Housing Dataset
Merges 3 CSV files and creates financial distress prediction features
"""

import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency
from statsmodels.stats.outliers_influence import variance_inflation_factor
import warnings
warnings.filterwarnings('ignore')

class HousingDataProcessor:
    """Process real housing dataset for financial distress prediction."""
    
    def __init__(self, data_dir='../../housing'):
        """Initialize with housing data directory."""
        self.data_dir = data_dir
        self.df = None
        
    def load_and_merge_datasets(self):
        """Load and merge the 3 CSV files."""
        print("\ Loading Housing Datasets...")
        
        family_info = pd.read_csv(f'{self.data_dir}/family_info.csv', index_col=0)
        house_utilities = pd.read_csv(f'{self.data_dir}/house_utilities.csv', index_col=0)
        household_expenses = pd.read_csv(f'{self.data_dir}/household_expenses.csv', index_col=0)
        
        print(f"   Family Info: {family_info.shape}")
        print(f"   House Utilities: {house_utilities.shape}")
        print(f"   Household Expenses: {household_expenses.shape}")
        
        self.df = pd.concat([family_info, house_utilities], axis=1)
        
 
        print(f"\n Merged dataset shape: {self.df.shape}")
        print(f"   Total columns: {len(self.df.columns)}")
        
        return self.df
    
    def clean_and_prepare_data(self):
        """Clean data and prepare for feature engineering."""
        print("\n🧹 Cleaning Data...")
        
        # Rename columns for consistency
        column_mapping = {
            'Total Household Income': 'Net_Income',
            'Total Food Expenditure': 'Food',
            'Housing and water Expenditure': 'Housing',
            'Transportation Expenditure': 'Transport',
            'Medical Care Expenditure': 'Health',
            'Education Expenditure': 'Education',
            'Restaurant and hotels Expenditure': 'Restaurants',
            'Clothing, Footwear and Other Wear Expenditure': 'Clothing',
            'Communication Expenditure': 'Communication',
            'Miscellaneous Goods and Services Expenditure': 'Miscellaneous',
            'Special Occasions Expenditure': 'Special_Occasions',
            'Total Number of Family members': 'Household_Size',
            'Type of Household': 'Household_Type',
            'Household Head Sex': 'Head_Sex',
            'Household Head Age': 'Head_Age',
            'Household Head Job or Business Indicator': 'Employment_Status',
            'Region': 'Region'
        }
        
        self.df.rename(columns=column_mapping, inplace=True)
        
        # Drop rows with missing income (can't calculate distress without it)
        initial_count = len(self.df)
        self.df = self.df[self.df['Net_Income'] > 0].copy()
        print(f"   Removed {initial_count - len(self.df)} rows with zero/missing income")
        
        # Fill missing expenditure values with 0 (assumption: didn't spend)
        expenditure_cols = ['Food', 'Housing', 'Transport', 'Health', 'Education', 
                           'Restaurants', 'Clothing', 'Communication', 'Miscellaneous']
        
        for col in expenditure_cols:
            if col in self.df.columns:
                self.df[col].fillna(0, inplace=True)
        
        # Add Recreation column (combine special occasions and restaurant partially)
        if 'Special_Occasions' in self.df.columns:
            self.df['Recreation'] = self.df['Special_Occasions']
        else:
            self.df['Recreation'] = 0
        
        # Handle missing household size
        if 'Household_Size' in self.df.columns:
            self.df['Household_Size'].fillna(self.df['Household_Size'].median(), inplace=True)
        else:
            self.df['Household_Size'] = 4  
        
        # Create Region if not exists
        if 'Region' not in self.df.columns:
            self.df['Region'] = 'Unknown'
        
        # Employment status
        if 'Employment_Status' in self.df.columns:
            self.df['Employment_Status'] = self.df['Employment_Status'].fillna('Unknown')
        else:
            self.df['Employment_Status'] = 'Unknown'
        
        # Household type
        if 'Household_Type' not in self.df.columns:
            self.df['Household_Type'] = 'Single Family'
        
        # Fill ALL categorical columns with 'Unknown' for any NaN values
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            self.df[col] = self.df[col].fillna('Unknown').astype(str)
        
        print(f"Data cleaned: {len(self.df)} usable records")
        
    def create_financial_distress_label(self):
        """
        Create target variable: Financial Distress Level
        Logic:
        - High: Expenditure/Income > 0.90
        - Medium: 0.70 <= Expenditure/Income <= 0.90
        - Low: Expenditure/Income < 0.70
        """
        print("\n📊 Creating Financial Distress Labels...")
        
        # Calculate total expenditure
        expenditure_cols = ['Food', 'Housing', 'Transport', 'Health', 'Education', 
                           'Recreation', 'Clothing', 'Communication', 'Miscellaneous']
        
        available_cols = [col for col in expenditure_cols if col in self.df.columns]
        self.df['Total_Expenditure'] = self.df[available_cols].sum(axis=1)
        
        # Calculate savings
        self.df['Savings'] = self.df['Net_Income'] - self.df['Total_Expenditure']
        
        # Calculate expenditure to income ratio
        self.df['Expenditure_to_Income_Ratio'] = self.df['Total_Expenditure'] / self.df['Net_Income']
        
        # Create distress labels
        conditions = [
            self.df['Expenditure_to_Income_Ratio'] > 0.90,
            (self.df['Expenditure_to_Income_Ratio'] >= 0.70) & (self.df['Expenditure_to_Income_Ratio'] <= 0.90),
            self.df['Expenditure_to_Income_Ratio'] < 0.70
        ]
        choices = ['High', 'Medium', 'Low']
        self.df['Financial_Distress'] = np.select(conditions, choices, default='Low')
        
        # Distribution
        print(f"Financial Distress Distribution:")
        print(self.df['Financial_Distress'].value_counts())
        print(f"\n   High Risk: {(self.df['Financial_Distress'] == 'High').sum() / len(self.df) * 100:.1f}%")
        print(f"   Medium Risk: {(self.df['Financial_Distress'] == 'Medium').sum() / len(self.df) * 100:.1f}%")
        print(f"   Low Risk: {(self.df['Financial_Distress'] == 'Low').sum() / len(self.df) * 100:.1f}%")
        
    def engineer_features(self):
        """Advanced feature engineering for financial analysis."""
        print("\n🔧 Engineering Advanced Features...")
        
        # 1. RATIOS
        self.df['Savings_Rate'] = self.df['Savings'] / self.df['Net_Income']
        self.df['Housing_to_Income_Ratio'] = self.df['Housing'] / self.df['Net_Income']
        self.df['Food_to_Total_Exp_Ratio'] = self.df['Food'] / self.df['Total_Expenditure'].replace(0, 1)
        self.df['Transport_to_Income_Ratio'] = self.df['Transport'] / self.df['Net_Income']
        
        # 2. RISK METRICS
        self.df['Essential_Spending'] = self.df['Food'] + self.df['Housing']
        self.df['Essential_Spending_Share'] = self.df['Essential_Spending'] / self.df['Total_Expenditure'].replace(0, 1)
        
        self.df['Discretionary_Spending'] = (self.df['Recreation'] + 
                                             self.df['Restaurants'] + 
                                             self.df['Clothing'])
        self.df['Discretionary_Spending_Share'] = self.df['Discretionary_Spending'] / self.df['Total_Expenditure'].replace(0, 1)
        
        # Per capita metrics
        self.df['Per_Capita_Income'] = self.df['Net_Income'] / self.df['Household_Size']
        self.df['Per_Capita_Expenditure'] = self.df['Total_Expenditure'] / self.df['Household_Size']
        
        # 3. VOLATILITY METRICS
        spending_cols = ['Food', 'Housing', 'Transport', 'Health', 'Education', 
                        'Recreation', 'Clothing', 'Communication', 'Miscellaneous']
        available_spending = [col for col in spending_cols if col in self.df.columns]
        
        self.df['Spending_Variance'] = self.df[available_spending].var(axis=1)
        self.df['Spending_Std'] = self.df[available_spending].std(axis=1)
        self.df['Spending_CV'] = self.df['Spending_Std'] / self.df['Total_Expenditure'].replace(0, 1)
        
        # 4. ADDITIONAL INSIGHTS
        self.df['Health_Spending_Ratio'] = self.df['Health'] / self.df['Net_Income']
        self.df['Education_Spending_Ratio'] = self.df['Education'] / self.df['Net_Income']
        
        # Financial buffer
        monthly_exp = self.df['Total_Expenditure'] / 12
        self.df['Months_of_Savings'] = self.df['Savings'] / monthly_exp.replace(0, 1)
        self.df['Months_of_Savings'] = self.df['Months_of_Savings'].replace([np.inf, -np.inf], 0)
        
        # Binary flags
        self.df['Is_Overspending'] = (self.df['Total_Expenditure'] > self.df['Net_Income']).astype(int)
        self.df['High_Housing_Burden'] = (self.df['Housing_to_Income_Ratio'] > 0.35).astype(int)
        self.df['Low_Savings'] = (self.df['Savings_Rate'] < 0.10).astype(int)
        
        print(f"Feature engineering complete")
        
    def statistical_validation(self):
        """Perform statistical tests."""
        print("\nRunning Statistical Validation...")
        
        # 1. ANOVA: Region vs Financial Distress (if Region exists with variance)
        if 'Region' in self.df.columns and self.df['Region'].nunique() > 1:
            print("\n ANOVA Test: Region vs Expenditure/Income Ratio")
            try:
                regions = self.df['Region'].unique()
                groups = [self.df[self.df['Region'] == region]['Expenditure_to_Income_Ratio'].values 
                         for region in regions if len(self.df[self.df['Region'] == region]) > 0]
                if len(groups) > 1:
                    f_stat, p_value = stats.f_oneway(*groups)
                    print(f"   F-statistic: {f_stat:.4f}")
                    print(f"   P-value: {p_value:.6f}")
                    if p_value < 0.05:
                        print(f" Region SIGNIFICANTLY affects financial distress")
                    else:
                        print(f"Region does NOT significantly affect financial distress")
            except:
                print(" Could not perform ANOVA test")
        
        # 2. Chi-Square: Household Size vs Financial Distress
        print("\n Chi-Square Test: Household Size vs Financial Distress")
        try:
            contingency_table = pd.crosstab(self.df['Household_Size'], self.df['Financial_Distress'])
            chi2, p_value, dof, expected = chi2_contingency(contingency_table)
            print(f"   Chi-Square: {chi2:.4f}")
            print(f"   P-value: {p_value:.6f}")
            if p_value < 0.05:
                print(f"  Household Size SIGNIFICANTLY affects financial distress")
            else:
                print(f"   Household Size does NOT significantly affect financial distress")
        except:
            print(" Could not perform Chi-Square test")
        
    def prepare_final_dataset(self):
        """Prepare final dataset for ML."""
        print("\n Preparing Final Dataset...")
        
        # Handle inf/nan values
        self.df = self.df.replace([np.inf, -np.inf], np.nan)
        
        # Fill NaN values
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if self.df[col].isna().sum() > 0:
                self.df[col].fillna(self.df[col].median(), inplace=True)
        
        # Encode target variable
        distress_mapping = {'Low': 0, 'Medium': 1, 'High': 2}
        self.df['Financial_Distress_Encoded'] = self.df['Financial_Distress'].map(distress_mapping)
        
        # Save processed data
        output_path = '../data/processed/household_budget_processed.csv'
        self.df.to_csv(output_path, index=True)
        print(f" Processed dataset saved to: {output_path}")
        print(f"   Total features: {len(self.df.columns)}")
        print(f"   Total samples: {len(self.df)}")
        
        return self.df

def main():
    """Main preprocessing pipeline for real housing data."""
    print("="*70)
    print(" HOUSING DATASET - DATA PREPROCESSING PIPELINE")
    print("="*70)
    
    # Initialize processor
    processor = HousingDataProcessor()
    
    # Execute pipeline
    processor.load_and_merge_datasets()
    processor.clean_and_prepare_data()
    processor.create_financial_distress_label()
    processor.engineer_features()
    processor.statistical_validation()
    df_processed = processor.prepare_final_dataset()
    
    print("\n" + "="*70)
    print(" DATA PREPROCESSING COMPLETE!")
    print("="*70)
    print(f"\n Final Dataset Summary:")
    print(f"   Samples: {len(df_processed):,}")
    print(f"   Features: {len(df_processed.columns)}")
    print(f"   Avg Income: ${df_processed['Net_Income'].mean():,.0f}")
    print(f"   Avg Expenditure: ${df_processed['Total_Expenditure'].mean():,.0f}")
    print(f"   Avg Savings: ${df_processed['Savings'].mean():,.0f}")
    
    return df_processed

if __name__ == '__main__':
    df_final = main()
