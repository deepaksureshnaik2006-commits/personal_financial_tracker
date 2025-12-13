# Personal Finance Tracker - User Guide

## Overview
A comprehensive web application for tracking personal finances with user authentication, budget management, and detailed analytics.

## Getting Started

### First Time Setup
1. Open the application
2. Click on the "Sign Up" tab
3. Create your account with a username and password
4. **Important**: The first user to register automatically becomes an admin
5. After successful registration, you will be redirected to the login tab
6. Enter your credentials to log in

### Login
- Use your username and password to log in
- Usernames can only contain letters, numbers, and underscores
- Password must be at least 6 characters long
- After signup, you must manually login (no automatic login)

## Features

### 1. Dashboard
The main dashboard displays:
- **Current Balance**: Total income minus total expenses
- **Total Income**: Sum of all income transactions
- **Total Expenses**: Sum of all expense transactions

### 2. Transaction Management
**Adding Transactions:**
- Select transaction type (Income or Expense)
- Choose a category
- Enter amount in Indian Rupees (₹)
- Select date
- Add optional notes
- Click "Add Transaction"

**Expense Categories:**
- Food
- Transport
- Shopping
- Bills
- Entertainment
- Other

**Income Categories:**
- Salary
- Freelance
- Investment
- Gift
- Other

**Viewing Transactions:**
- Search by keyword
- Filter by date range (From/To)
- Filter by category
- View transaction history sorted by date
- Delete individual transactions

### 3. Budget Management
**Creating Budgets:**
- Click "Add Budget" button
- Select expense category
- Set limit amount in ₹
- Choose period (Weekly or Monthly)
- Click "Create Budget"

**Budget Alerts:**
- Automatic alerts when spending reaches 80% of budget
- Visual progress bars showing spending vs. limit
- Color-coded warnings for overspending

### 4. Analytics
**Expense Breakdown:**
- Pie chart showing distribution of expenses by category
- Percentage breakdown for each category

**Income vs Expenses:**
- Bar chart comparing total income and expenses
- Visual representation of financial health

### 5. Account Settings
**View Account Information:**
- Navigate to the Settings tab
- View your username, role, and statistics
- See total transactions and active budgets

**Delete Your Account:**
- Go to Settings tab
- Scroll to "Danger Zone" section
- Click "Delete Account" button
- Confirm the deletion
- **Warning**: This action is permanent and cannot be undone
- All your transactions, budgets, and account data will be deleted

### 6. Data Management
**Export Data:**
- Click "Export" button to download transactions as CSV
- File includes date, type, category, amount, and notes

**Clear All Data:**
- Click "Clear All" button
- Confirms before deleting all transactions and budgets
- Cannot be undone

## Admin Features
(Available only to admin users)

### User Management
- View all registered users
- Change user roles (User ↔ Admin)
- Delete other users (not yourself)
- View user registration dates

**Admin Panel Access:**
- Click "Admin" in the navigation menu
- Only visible to admin users

**Admin Limitations:**
- Admins cannot delete their own account via the Admin panel
- To delete your own account, use the Settings tab

## Tips for Best Use

1. **Regular Updates**: Add transactions daily for accurate tracking
2. **Set Realistic Budgets**: Start with achievable limits and adjust as needed
3. **Use Categories**: Properly categorize transactions for better insights
4. **Review Analytics**: Check charts weekly to understand spending patterns
5. **Export Regularly**: Download CSV backups of your data periodically
6. **Secure Your Account**: Use a strong password and keep it safe

## Security Notes

- All data is stored locally in your browser
- No data is sent to external servers
- Clearing browser data will delete all information
- Each user's data is isolated and secure
- Admin cannot view other users' transactions
- Account deletion is permanent and irreversible

## Account Management

### Creating an Account
1. Click "Sign Up" tab
2. Enter username (letters, numbers, underscores only)
3. Enter password (minimum 6 characters)
4. Confirm password
5. Click "Sign Up"
6. You will be redirected to login - enter your credentials

### Deleting Your Account
1. Log in to your account
2. Navigate to Dashboard
3. Click on "Settings" tab
4. Scroll to "Danger Zone"
5. Click "Delete Account"
6. Confirm deletion in the dialog
7. Your account and all data will be permanently deleted

## Troubleshooting

**Can't log in?**
- Check username and password spelling
- Usernames are case-insensitive
- Ensure password is correct (case-sensitive)

**Lost admin access?**
- Only the first registered user is admin
- Contact an existing admin to grant admin rights

**Data disappeared?**
- Check if browser data was cleared
- Ensure you're using the same browser
- Data is stored per browser/device

**After signup, can't access dashboard?**
- You must manually login after creating an account
- Enter your username and password on the login tab

## Important Notes

⚠️ **Supabase Backend**: The application was designed to use Supabase for cloud storage, but it's currently unavailable. All data is stored locally in your browser. For cloud-based storage and multi-device sync, please contact Miaoda official support.

⚠️ **Account Deletion**: Deleting your account is permanent. All transactions, budgets, and account information will be lost forever. Make sure to export your data before deletion if you need a backup.

## Support

For technical support or feature requests, please contact Miaoda official support.
