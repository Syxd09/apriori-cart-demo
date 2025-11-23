# SmartMart - Apriori Recommendation Demo

A simple supermarket website demonstrating market basket analysis using the Apriori algorithm for product recommendations.

## 🎯 Purpose

This is a 5-minute classroom presentation demo that showcases how association rules from the Apriori algorithm can power real-time product recommendations in an e-commerce setting.

## ✨ Features

- **Enhanced Product Catalog**: 100+ realistic supermarket items across 12 categories
- **Shopping Cart**: Add/remove items with live updates
- **Advanced Smart Recommendations**: Real-time suggestions using enhanced Apriori algorithm with multiple quality metrics (conviction, leverage, jaccard, cosine, kulczynski, imbalance ratio)
- **Product Details**: Individual product pages with personalized recommendations
- **Visual Feedback**: Clear explanations of why items are recommended with comprehensive confidence scores
- **Algorithm Insights**: Live statistics showing active rules, enhanced metrics, and recommendation quality
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Performance Optimized**: Rules cached in localStorage for fast loading

## 🚀 How to Run

### Option 1: 

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
The recommendation system dynamically computes association rules in real-time using the Apriori algorithm on simulated transaction data. The algorithm finds patterns in shopping behavior:

- **Antecedent**: Items already in cart
- **Consequent**: Items to recommend
- **Confidence**: Probability of buying consequent given antecedent
- **Support**: Frequency of the itemset

### Dynamic Rule Generation
Rules are computed on page load from 2000+ simulated transactions with realistic grocery shopping patterns using customer segments and temporal behaviors. The enhanced algorithm uses optimized parameters (2% minimum support, 25% minimum confidence) and filters rules with multiple quality metrics (lift > 1.1, conviction > 1.2, leverage > 0.01) for better relevance. For example, if the algorithm finds that 72% of transactions containing Milk also contain Bread, it creates the rule: "Milk → Bread" with additional quality metrics.

### Real-time Recommendations
1. User adds items to cart
2. System checks which rules match cart contents
3. Displays consequent items not already in cart
4. Shows explanation of why items are recommended

## 📁 Project Structure

```
├── src/
│   ├── lib/
│   │   └── apriori.ts          # Apriori algorithm implementation
│   ├── pages/
│   │   ├── Index.tsx           # Main shopping page with recommendations
│   │   ├── ProductDetail.tsx   # Individual product pages
│   │   └── NotFound.tsx        # 404 error page
│   ├── components/ui/          # Reusable UI components
│   ├── index.css               # Design system & styles
│   └── ...
└── README.md
```

## 🎨 Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Algorithm**: Apriori (computed dynamically)

## 📖 Dataset

The system generates 2000+ realistic supermarket transactions on page load, using customer segments, temporal patterns, and shopping behaviors. The enhanced Apriori algorithm analyzes these transactions to discover association rules with multiple quality metrics. In a real-world scenario, this would use actual transaction data from a retail database.

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
- Rules are computed once and cached in localStorage for fast subsequent loads
- Optimized algorithm parameters for better recommendation quality
- Perfect for quick demonstrations and educational purposes
- Easily extendable with more products or transaction patterns

## 🔗 Learn More

- [Apriori Algorithm](https://en.wikipedia.org/wiki/Apriori_algorithm)
- [Market Basket Analysis](https://en.wikipedia.org/wiki/Affinity_analysis)
