# Personal Finance Tracker Requirements Document

## 1. Tool Name
Personal Finance Tracker\n
## 2. Tool Description
A beginner-friendly web application that helps users track their daily expenses and income, visualize spending patterns, and manage their budget effectively. Perfect for students, young professionals, and anyone looking to gain better control over their personal finances. Features secure user authentication and displays all amounts in Indian Rupees (Rs).

## 3. Core Features

### 3.1 User Authentication
- Sign up page with email and password
- Password strength indicator during registration
- Automatic redirect to login page after successful account creation
- Login page with email and password
- User profile display showing username/email
- Logout option in user menu
- Delete account option in user settings with confirmation prompt

### 3.2 Transaction Management
- Quick add buttons for common expense categories (Food, Transport, Shopping, Bills, Entertainment)
- Income entry option with category selection
- Amount input with Rs currency symbol display
- Date picker for transaction date
- Optional note field for transaction details

### 3.3 Balance Overview
- Current balance display at the top in Rs
- Total income counter in Rs
- Total expenses counter in Rs
- Net balance calculation (income minus expenses) in Rs

### 3.4 Transaction History
- Chronological list of all transactions with Rs amounts
- Color-coded entries (green for income, red for expenses)
- Category icons for quick identification
- Delete option for each transaction
- Filter by date range or category
- Search transactions by note or amount

### 3.5 Visual Analytics
- Simple pie chart showing expense breakdown by category
- Bar chart comparing income vs expenses
- Weekly or monthly view toggle
- Spending trend line chart over time

### 3.6 Budget Management
- Set monthly budget limit in Rs
- Budget progress bar showing spent vs remaining amount
- Alert notification when approaching budget limit
- Category-wise budget allocation option

### 3.7 Recurring Transactions
- Add recurring income or expenses (daily, weekly, monthly)
- Automatic transaction creation based on schedule
- Edit or delete recurring transaction templates
\n### 3.8 Data Management
- All user data saved securely per account
- Export data as CSV file option
- Clear all data option with confirmation
- Backup and restore functionality

## 4. Design Style

- **Color Scheme**: Deep purple (#6200EA) as primary color, light lavender (#F3E5F5) for backgrounds, white (#FFFFFF) for cards, green (#00C853) for income, red (#D50000) for expenses
- **Visual Elements**: Smooth rounded corners (16px radius), soft shadows for card elevation, gentle hover effects on buttons, clean dividers between sections
- **Layout**: Dashboard-style layout with balance summary at top, card-based sections for different features, responsive grid for charts and lists
- **Currency Display**: Rs symbol prominently displayed before all amounts with proper formatting (e.g., Rs 1,234.50)