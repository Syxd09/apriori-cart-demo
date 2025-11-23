# SmartMart - Apriori Recommendation Demo

A simple supermarket website demonstrating market basket analysis using the Apriori algorithm for product recommendations.

## 🎯 Purpose

This is a 5-minute classroom presentation demo that showcases how association rules from the Apriori algorithm can power real-time product recommendations in an e-commerce setting.

## ✨ Features

- **Product Catalog**: 10 common supermarket items
- **Shopping Cart**: Add/remove items with live updates
- **Smart Recommendations**: Real-time suggestions based on Apriori association rules
- **Visual Feedback**: Clear explanations of why items are recommended
- **Responsive Design**: Works on desktop and mobile

## 🚀 How to Run

### Option 1: Using Lovable (Recommended)
1. Open the project in [Lovable](https://lovable.dev)
2. The app runs automatically in the preview window

### Option 2: Local Development
```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open `http://localhost:8080` in your browser.

## 📊 How It Works

### Apriori Algorithm
The recommendation system uses pre-computed association rules stored in `public/rules.json`. These rules were derived from market basket analysis:

- **Antecedent**: Items already in cart
- **Consequent**: Items to recommend
- **Confidence**: Probability of buying consequent given antecedent
- **Support**: Frequency of the itemset

### Example Rule
```json
{
  "antecedent": ["Milk"],
  "consequent": ["Bread"],
  "confidence": 0.72,
  "support": 0.35
}
```

This means: "72% of customers who bought Milk also bought Bread"

### Real-time Recommendations
1. User adds items to cart
2. System checks which rules match cart contents
3. Displays consequent items not already in cart
4. Shows explanation of why items are recommended

## 📁 Project Structure

```
├── src/
│   ├── pages/
│   │   └── Index.tsx          # Main application page
│   ├── index.css              # Design system & styles
│   └── ...
├── public/
│   └── rules.json             # Apriori association rules
└── README.md
```

## 🎨 Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Algorithm**: Apriori (pre-computed rules)

## 📖 Dataset

The Apriori rules in `rules.json` are based on typical grocery store transaction patterns. In a real-world scenario, these would be computed from actual transaction data using Python libraries like `mlxtend` or `apyori`.

## 🎓 For Presentation

**Demo Flow:**
1. Show empty cart and products
2. Add "Milk" → See "Bread" recommendation
3. Add "Eggs" → See "Butter" recommendation  
4. Add multiple items → See compound recommendations
5. Explain the Apriori rules behind each suggestion

**Key Points to Highlight:**
- Real-time rule matching
- Multiple rules can apply simultaneously
- Already-purchased items are filtered out
- Clear explanation of recommendation reasoning

## 📝 Notes

- No backend required - everything runs in the browser
- Rules are preloaded for instant performance
- Perfect for quick demonstrations
- Easily extendable with more products/rules

## 🔗 Learn More

- [Lovable Documentation](https://docs.lovable.dev/)
- [Apriori Algorithm](https://en.wikipedia.org/wiki/Apriori_algorithm)
- [Market Basket Analysis](https://en.wikipedia.org/wiki/Affinity_analysis)
