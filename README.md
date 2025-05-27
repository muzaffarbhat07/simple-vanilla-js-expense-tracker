# Expense Tracker

A simple vanilla JavaScript expense tracker application with local storage.

## Features
- Add/Remove transactions
- Filter by date and context
- Import/Export functionality in CSV/JSON formats
- Local storage persistence
- Responsive design
- Indian Rupee (₹) currency format

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

This will start a development server at http://localhost:3000 with live reload enabled.

## Project Structure
```plaintext
expense-tracker/
├── src/
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── services/
│   │   │   ├── StorageService.js
│   │   │   ├── TransactionService.js
│   │   │   └── ExportService.js
│   │   └── ui/
│   │       ├── components/
│   │       │   ├── TransactionList.js
│   │       │   ├── TransactionForm.js
│   │       │   └── FilterForm.js
│   │       └── UIService.js
│   └── assets/
│       └── css/
│           ├── main.css
│           ├── components/
│           │   ├── forms.css
│           │   ├── buttons.css
│           │   ├── cards.css
│           │   └── transactions.css
│           └── utils/
│               └── variables.css
├── scripts/
│   └── build.js
└── package.json
```

## Production Build
To create a production-ready build, run:
```bash
npm run build
```
This script compiles and optimizes your application for deployment.

## Contributing
Contributions are welcome!

## Acknowledgments
- Built with vanilla JavaScript
- Uses modern ES6+ features
- Implements modular design patterns