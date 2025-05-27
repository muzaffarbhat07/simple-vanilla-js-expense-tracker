import { TransactionForm } from './components/TransactionForm.js';
import { FilterForm } from './components/FilterForm.js';
import { TransactionList } from './components/TransactionList.js';
import { formatCurrency } from '../utils/formatters.js';
import { ImportExportModal } from './components/ImportExportModal.js';
import { ExportService } from '../services/ExportService.js';


export class UIService {
    constructor(transactionService) {
        this.transactionService = transactionService;
        this.activeForm = null;
        this.init();
    }

    init() {
        this.transactionForm = new TransactionForm(this.handleTransactionSubmit.bind(this));
        this.filterForm = new FilterForm(this.handleFilterSubmit.bind(this));
        this.transactionList = new TransactionList(this.handleTransactionDelete.bind(this));
        
        this.render();
        this.initializeFormControls();
        this.updateUI();
    }

    render() {
        document.getElementById('filterForm').appendChild(this.filterForm.render());
        document.getElementById('transactionForm').appendChild(this.transactionForm.render());
        document.getElementById('transactionList').appendChild(this.transactionList.render());
    }

    initializeFormControls() {
        // Show buttons
        document.getElementById('showTransactionForm').addEventListener('click', () => 
            this.toggleForm('transaction'));
        
        document.getElementById('showFilterForm').addEventListener('click', () => 
            this.toggleForm('filter'));

        // Close buttons
        document.querySelectorAll('.close-form').forEach(button => {
            button.addEventListener('click', (e) => {
                const formType = e.target.dataset.form;
                this.closeForm(formType);
            });
        });

        // Close form when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeForm && !e.target.closest('.form-container') && 
                !e.target.closest('.action-buttons')) {
                this.closeForm(this.activeForm);
            }
        });

        // Import/Export
        const actionButtons = document.querySelector('.action-buttons');
        const importExportBtn = document.createElement('button');
        importExportBtn.className = 'btn btn-secondary';
        importExportBtn.innerHTML = '<i class="fas fa-file-import"></i> Import/Export';
        importExportBtn.onclick = () => this.showImportExportModal();
        actionButtons.appendChild(importExportBtn);
    }

    toggleForm(formType) {
        const transactionContainer = document.getElementById('transactionFormContainer');
        const filterContainer = document.getElementById('filterFormContainer');

        // Close active form if clicking the same button
        if (this.activeForm === formType) {
            this.closeForm(formType);
            return;
        }

        // Close any active form
        if (this.activeForm) {
            this.closeForm(this.activeForm);
        }

        // Open requested form
        if (formType === 'transaction') {
            transactionContainer.classList.add('active');
            this.activeForm = 'transaction';
        } else if (formType === 'filter') {
            filterContainer.classList.add('active');
            this.activeForm = 'filter';
        }
    }

    closeForm(formType) {
        const container = document.getElementById(`${formType}FormContainer`);
        container.classList.remove('active');
        this.activeForm = null;
    }

    updateUI(filters = {}) {
      const transactions = this.transactionService.getFiltered(filters);
      this.transactionList.update(transactions);
      this.updateTotals(transactions);
    }

    updateTotals(transactions) {
        const totals = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });

        document.getElementById('income').textContent = formatCurrency(totals.income);
        document.getElementById('expenses').textContent = formatCurrency(totals.expenses);
        document.getElementById('total-savings').textContent = 
          formatCurrency(totals.income - totals.expenses);
    }

    handleTransactionSubmit(data) {
        this.transactionService.add(data);
        this.updateUI();
        this.closeForm('transaction');
    }

    handleFilterSubmit(filters) {
        this.updateUI(filters);
        this.closeForm('filter');
    }

    handleTransactionDelete(id) {
        this.transactionService.delete(id);
        this.updateUI();
    }

    showImportExportModal() {
        const modal = new ImportExportModal(this.handleImport.bind(this));
        document.body.appendChild(modal.render());

        // Add export event listeners
        document.getElementById('exportCSV').onclick = () => {
            ExportService.exportToCSV(this.transactionService.transactions);
        };

        document.getElementById('exportJSON').onclick = () => {
            ExportService.exportToJSON(this.transactionService.transactions);
        };
    }

    async handleImport(transactions) {
      try {
          this.transactionService.importTransactions(transactions);
          this.updateUI();
          return true;
      } catch (error) {
          throw new Error(`Failed to import transactions: ${error.message}`);
      }
  }

    parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].toLowerCase().trim().split(',');
                
                const transactions = lines.slice(1)
                    .filter(line => line.trim())
                    .map(line => {
                        const values = line.split(',');
                        const transaction = {};
                        headers.forEach((header, index) => {
                            transaction[header.trim()] = values[index].trim();
                        });
                        return transaction;
                    });

                resolve(transactions);
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    parseJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const transactions = JSON.parse(e.target.result);
                    resolve(transactions);
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
}
