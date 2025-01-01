document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    updateTheme();
});

function updateTheme() {
    const isLightMode = document.body.classList.contains('light-mode');
    if (isLightMode) {
        document.body.style.background = 'linear-gradient(135deg, rgba(240, 240, 240, 0.9), rgba(255, 255, 255, 0.9))'; // Light mode background
        document.body.style.color = '#1c1c1c'; // Light mode text color
    } else {
        document.body.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(0, 0, 0, 0.9))'; // Dark mode background
        document.body.style.color = '#e0e0e0'; // Dark mode text color
    }
}

const financeForm = document.getElementById('finance-form');
const goalForm = document.getElementById('goal-form');
const searchInput = document.getElementById('search');
const filterTypeSelect = document.getElementById('filter-type');
const filterCategorySelect = document.getElementById('filter-category');
const transactionList = document.getElementById('transaction-list');
const summary = document.getElementById('summary');
const transactionCount = document.getElementById('transaction-count');
const goalInfo = document.getElementById('goal-info');
const goalProgressBar = document.getElementById('goal-progress');

let transactions = [];
let goal = null;

financeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const recurring = document.getElementById('recurring').checked;

    const transaction = { description, amount, type, category, recurring };
    transactions.push(transaction);
    saveTransactions();
    updateUI();
    financeForm.reset();
});

goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const amount = parseFloat(document.getElementById('goal-amount').value);

    goal = { description, amount };
    saveGoal();
    updateUI();
    goalForm.reset();
});

document.getElementById('clear-goal').addEventListener('click', () => {
    goal = null;
    saveGoal();
    updateUI();
});

document.getElementById('clear-data').addEventListener('click', () => {
    transactions = [];
    saveTransactions();
    updateUI();
});

document.getElementById('export-data').addEventListener('click', exportData);

function exportData() {
    const transactions = getTransactions();
    if (transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }

    const csvRows = [];
    const headers = ['Description', 'Amount', 'Type', 'Category', 'Recurring'];
    csvRows.push(headers.join(','));

    for (const transaction of transactions) {
        const row = [
            transaction.description,
            transaction.amount,
            transaction.type,
            transaction.category,
            transaction.recurring ? 'Yes' : 'No'
        ];
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transactions.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

function saveGoal() {
    localStorage.setItem('goal', JSON.stringify(goal));
}

function getGoal() {
    return JSON.parse(localStorage.getItem('goal')) || null;
}

function updateUI() {
    transactionList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - $${transaction.amount.toFixed(2)} (${transaction.type}) [${transaction.category}]`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTransaction(index);
        li.appendChild(deleteButton);

        transactionList.appendChild(li);
    });
    updateTransactionCount();
    displayGoal();
    renderIncomeExpenseChart(); // Call the chart rendering function here
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    updateUI();
}

function updateTransactionCount() {
    transactionCount.textContent = `Total Transactions: ${transactions.length}`;
}

function displayGoal() {
    if (goal) {
        goalInfo.textContent = `${goal.description} - $${goal.amount}`;
        updateGoalProgress();
    } else {
        goalInfo.textContent = 'No goal set';
        goalProgressBar.style.width = '0%'; // Reset progress bar
        document.querySelector('.progress').style.strokeDasharray = '0 283'; // Reset circular progress
        document.getElementById('progress-text').textContent = '0%'; // Reset text
    }
}

function updateGoalProgress() {
    if (goal) {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const progress = Math.min((totalIncome / goal.amount) * 100, 100); // Cap at 100%
        goalProgressBar.style.width = `${progress}%`; // Update progress bar width
        
        // Update circular progress
        const circumference = 2 * Math.PI * 45; // Circle radius is 45
        const offset = circumference - (progress / 100 * circumference);
        document.querySelector('.progress').style.strokeDasharray = `${circumference} ${circumference}`;
        document.querySelector('.progress').style.strokeDashoffset = offset;
        document.getElementById('progress-text').textContent = `${Math.round(progress)}%`; // Update text
    }
}

function renderIncomeExpenseChart() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const ctx = document.getElementById('income-expense-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie', // You can change this to 'bar' or 'doughnut' for different styles
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Income vs Expense',
                data: [income, expense],
                backgroundColor: [
                    'rgba(0, 179, 0, 0.6)', // Income color
                    'rgba(255, 87, 34, 0.6)' // Expense color
                ],
                borderColor: [
                    'rgba(0, 179, 0, 1)',
                    'rgba(255, 87, 34, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    transactions = getTransactions();
    goal = getGoal();
    updateUI();
});