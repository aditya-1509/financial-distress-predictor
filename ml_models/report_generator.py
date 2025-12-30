"""
PDF Report Generator for Financial Health Reports
Uses ReportLab to create professional financial assessment reports
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle, Paragraph, 
                                Spacer, PageBreak, Image, Frame, KeepTogether)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime
import base64
import io
from pathlib import Path

class FinancialReportGenerator:
    """Generate PDF reports for financial health assessments."""
    
    def __init__(self, output_dir='../reports'):
        """Initialize report generator."""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True, parents=True)
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom paragraph styles."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#283593'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Risk level style
        self.styles.add(ParagraphStyle(
            name='RiskLevel',
            parent=self.styles['Normal'],
            fontSize=20,
            alignment=TA_CENTER,
            spaceAfter=20,
            fontName='Helvetica-Bold'
        ))
    
    def generate_report(self, user_id, user_data, prediction_result, 
                       recommendations, financial_metrics, shap_plot_base64=None):
        """
        Generate comprehensive financial health PDF report.
        
        Args:
            user_id: User identifier
            user_data: Dict with household financial data
            prediction_result: Dict with prediction, confidence, probabilities
            recommendations: List of recommendation dicts
            financial_metrics: Dict with calculated metrics
            shap_plot_base64: Base64 encoded SHAP plot (optional)
        
        Returns:
            Path to generated PDF
        """
        # Create PDF filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        pdf_filename = f'financial_report_{user_id}_{timestamp}.pdf'
        pdf_path = self.output_dir / pdf_filename
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for PDF elements
        story = []
        
        # Title Section
        story.append(Paragraph("Financial Health Assessment Report", self.styles['CustomTitle']))
        story.append(Spacer(1, 0.2*inch))
        
        # Report info
        report_date = datetime.now().strftime('%B %d, %Y')
        story.append(Paragraph(f"<b>Report Date:</b> {report_date}", self.styles['Normal']))
        story.append(Paragraph(f"<b>User ID:</b> {user_id}", self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Risk Assessment Section
        story.append(Paragraph("Financial Distress Level", self.styles['CustomSubtitle']))
        
        # Risk level with color
        risk_level = prediction_result['prediction']
        confidence = prediction_result['confidence'] * 100
        
        risk_colors = {
            'Low': colors.HexColor('#4caf50'),
            'Medium': colors.HexColor('#ff9800'),
            'High': colors.HexColor('#f44336')
        }
        
        risk_color = risk_colors.get(risk_level, colors.black)
        risk_style = ParagraphStyle(
            'RiskColored',
            parent=self.styles['RiskLevel'],
            textColor=risk_color
        )
        
        story.append(Paragraph(f"{risk_level} Risk", risk_style))
        story.append(Paragraph(f"Confidence: {confidence:.1f}%", self.styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Probability table
        prob_data = [
            ['Risk Level', 'Probability'],
            ['Low Risk', f"{prediction_result['probabilities']['Low']*100:.1f}%"],
            ['Medium Risk', f"{prediction_result['probabilities']['Medium']*100:.1f}%"],
            ['High Risk', f"{prediction_result['probabilities']['High']*100:.1f}%"]
        ]
        
        prob_table = Table(prob_data, colWidths=[3*inch, 2*inch])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3f51b5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e8eaf6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        story.append(prob_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Financial Metrics Section
        story.append(Paragraph("Key Financial Metrics", self.styles['CustomSubtitle']))
        
        metrics_data = [
            ['Metric', 'Value'],
            ['Monthly Income', f"${user_data['Net_Income']:,.2f}"],
            ['Total Expenditure', f"${financial_metrics['total_expenditure']:,.2f}"],
            ['Monthly Savings', f"${financial_metrics['savings']:,.2f}"],
            ['Savings Rate', f"{financial_metrics['savings_rate_pct']:.1f}%"],
            ['Expenditure/Income Ratio', f"{financial_metrics['expenditure_to_income_pct']:.1f}%"],
            ['Housing Burden', f"{financial_metrics['housing_burden_pct']:.1f}%"]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3f51b5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e8eaf6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#e8eaf6'), colors.white])
        ]))
        
        story.append(metrics_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Spending Breakdown
        story.append(Paragraph("Monthly Spending Breakdown", self.styles['CustomSubtitle']))
        
        spending_categories = [
            ('Food', user_data['Food']),
            ('Housing', user_data['Housing']),
            ('Transport', user_data['Transport']),
            ('Health', user_data['Health']),
            ('Education', user_data['Education']),
            ('Recreation', user_data['Recreation']),
            ('Clothing', user_data['Clothing']),
            ('Communication', user_data['Communication']),
            ('Restaurants', user_data['Restaurants']),
            ('Miscellaneous', user_data['Miscellaneous'])
        ]
        
        spending_data = [['Category', 'Amount', '% of Income']]
        for cat, amount in spending_categories:
            pct = (amount / user_data['Net_Income']) * 100
            spending_data.append([cat, f"${amount:,.2f}", f"{pct:.1f}%"])
        
        spending_table = Table(spending_data, colWidths=[2*inch, 1.8*inch, 1.2*inch])
        spending_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3f51b5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#e8eaf6'), colors.white])
        ]))
        
        story.append(spending_table)
        story.append(PageBreak())
        
        # SHAP Explanation (if available)
        if shap_plot_base64:
            story.append(Paragraph("AI Explanation: Why This Risk Level?", self.styles['CustomSubtitle']))
            story.append(Paragraph(
                "The chart below shows which factors contributed most to your risk assessment. "
                "Bars pointing right increase risk, while bars pointing left decrease risk.",
                self.styles['Normal']
            ))
            story.append(Spacer(1, 0.2*inch))
            
            try:
                # Decode base64 image
                image_data = base64.b64decode(shap_plot_base64)
                image_buffer = io.BytesIO(image_data)
                
                # Add image to PDF
                img = Image(image_buffer, width=6*inch, height=3*inch)
                story.append(img)
                story.append(Spacer(1, 0.3*inch))
            except Exception as e:
                print(f"Error adding SHAP plot: {e}")
        
        # Recommendations Section
        story.append(PageBreak())
        story.append(Paragraph("Personalized Recommendations", self.styles['CustomSubtitle']))
        story.append(Spacer(1, 0.2*inch))
        
        for i, rec in enumerate(recommendations, 1):
            # Recommendation number
            story.append(Paragraph(f"<b>{i}. {rec['title']}</b>", self.styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
            
            # Priority and category
            priority_colors = {
                'High': colors.HexColor('#f44336'),
                'Medium': colors.HexColor('#ff9800'),
                'Low': colors.HexColor('#4caf50')
            }
            
            rec_info = f"<font color='grey'>Priority: </font><font color='{priority_colors.get(rec['priority'], colors.black)}'><b>{rec['priority']}</b></font> | Category: {rec['category']}"
            story.append(Paragraph(rec_info, self.styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
            
            # Message and action
            story.append(Paragraph(f"<i>{rec['message']}</i>", self.styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
            story.append(Paragraph(f"<b>Action:</b> {rec['action']}", self.styles['Normal']))
            story.append(Spacer(1, 0.25*inch))
        
        # Footer/Disclaimer
        story.append(Spacer(1, 0.5*inch))
        disclaimer = (
            "<i>Disclaimer: This report is generated by an AI system for informational purposes only. "
            "It should not be considered as professional financial advice. Please consult with a "
            "certified financial advisor for personalized guidance.</i>"
        )
        story.append(Paragraph(disclaimer, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        print(f"✅ Report generated: {pdf_path}")
        return str(pdf_path)

if __name__ == '__main__':
    # Test report generation
    generator = FinancialReportGenerator()
    
    test_data = {
        'Net_Income': 300000,
        'Food': 60000,
        'Housing': 120000,
        'Transport': 30000,
        'Health': 15000,
        'Education': 20000,
        'Recreation': 15000,
        'Clothing': 10000,
        'Communication': 8000,
        'Restaurants': 12000,
        'Miscellaneous': 5000
    }
    
    test_prediction = {
        'prediction': 'Medium',
        'confidence': 0.85,
        'probabilities': {'Low': 0.10, 'Medium': 0.85, 'High': 0.05}
    }
    
    test_metrics = {
        'total_expenditure': 295000,
        'savings': 5000,
        'savings_rate_pct': 1.67,
        'expenditure_to_income_pct': 98.33,
        'housing_burden_pct': 40.0,
        'essential_spending_pct': 61.02,
        'discretionary_spending_pct': 12.54
    }
    
    test_recommendations = [
        {
            'category': 'Housing',
            'priority': 'High',
            'title': 'Reduce Housing Costs',
            'message': 'Housing is 40% of income',
            'action': 'Consider downsizing'
        }
    ]
    
    pdf_path = generator.generate_report(
        user_id='TEST001',
        user_data=test_data,
        prediction_result=test_prediction,
        recommendations=test_recommendations,
        financial_metrics=test_metrics
    )
    
    print(f"Test report: {pdf_path}")
