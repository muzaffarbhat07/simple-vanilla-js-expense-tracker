import { StorageService } from './StorageService.js';
import { Transaction } from '../models/Transaction.js';

export class TransactionService {
    constructor() {
        this.transactions = StorageService.get();
    }

    add(transactionData) {
      console.log({transactionData});
        const transaction = new Transaction(
            transactionData.description,
            transactionData.amount,
            transactionData.date,
            transactionData.type,
            transactionData.context
        );
        transaction.validate();
        this.transactions.push(transaction);
        this.save();
        return transaction;
    }

    delete(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();
    }

    getFiltered(filters = {}) {
        return this.transactions.filter(transaction => {
            // Date filtering
            if (filters.startDate && filters.endDate) {
                const transactionDate = new Date(transaction.date);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                
                if (transactionDate < startDate || transactionDate > endDate) {
                    return false;
                }
            }

            // Context filtering
            if (filters.contexts && filters.contexts.length > 0) {
                return filters.contexts.includes(transaction.context);
            }

            return true;
        });
    }

    save() {
        StorageService.save(this.transactions);
    }

    importTransactions(transactions) {
        const validTransactions = transactions.map(transaction => ({
            id: Date.now() + Math.random(),
            description: transaction.description,
            amount: parseFloat(transaction.amount),
            date: transaction.date,
            type: transaction.type.toLowerCase(),
            context: transaction.context || '', // Default context
            createdAt: new Date()
        }));
  
        this.transactions = [...this.transactions, ...validTransactions];
        this.save();
    }
}