import { formatCurrency, formatDate } from '../../utils/formatters.js';

export class TransactionList {
    constructor(onDelete) {
        this.onDelete = onDelete;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'transactions';
        container.innerHTML = `
            <h2>Transactions</h2>
            <div class="transaction-list" id="transactionItems"></div>
        `;
        return container;
    }

    update(transactions) {
        const container = document.getElementById('transactionItems');
        if (!container) return;

        container.innerHTML = transactions.length ? 
            transactions.map(transaction => this.createTransactionItem(transaction)).join('') :
            '<p class="no-transactions">No transactions found</p>';
    }

    createTransactionItem(transaction) {
        return `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <h3>${transaction.description}</h3>
                    <div class="transaction-details">
                        <span class="date">${formatDate(transaction.date)}</span>
                        <span class="context-badge ${transaction.context}">${transaction.context}</span>
                    </div>
                </div>
                <div class="transaction-amount">
                    <span class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}
                        ${formatCurrency(transaction.amount)}
                    </span>
                    <button 
                        class="btn btn-danger btn-sm" 
                        onclick="app.uiService.handleTransactionDelete(${transaction.id})"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    }
}