export class ImportExportModal {
  constructor(onImport) {
      this.onImport = onImport;
  }

  render() {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
          <div class="modal-content">
              <div class="modal-header">
                  <h2>Import/Export Transactions</h2>
                  <button class="close-modal">&times;</button>
              </div>
              <div class="modal-body">
                  <div class="export-section">
                      <h3>Export Transactions</h3>
                      <div class="button-group">
                          <button class="btn btn-primary" id="exportCSV">
                              Export as CSV
                          </button>
                          <button class="btn btn-primary" id="exportJSON">
                              Export as JSON
                          </button>
                      </div>
                  </div>
                  <div class="import-section">
                      <h3>Import Transactions</h3>
                      <div class="file-input-container">
                          <input type="file" id="importFile" accept=".csv,.json">
                          <button class="btn btn-secondary" id="importBtn">
                              Import
                          </button>
                      </div>
                      <div class="import-info">
                          Supported formats: CSV, JSON
                          <p class="text-muted">CSV headers: Date, Description, Amount, Type</p>
                      </div>
                  </div>
              </div>
              <div id="importStatus" class="import-status"></div>
          </div>
      `;

      this.attachEventListeners(modal);
      return modal;
  }

  attachEventListeners(modal) {
      modal.querySelector('.close-modal').addEventListener('click', () => this.close());

      const importBtn = modal.querySelector('#importBtn');
      const fileInput = modal.querySelector('#importFile');

      importBtn.addEventListener('click', async () => {
          const file = fileInput.files[0];
          if (!file) {
              this.showStatus('Please select a file first', 'error');
              return;
          }
          await this.handleImport(file);
      });
  }

  async handleImport(file) {
      try {
          this.showStatus('Processing file...', 'info');
          const fileType = file.name.split('.').pop().toLowerCase();
          let transactions;

          if (fileType === 'csv') {
              transactions = await this.parseCSV(file);
          } else if (fileType === 'json') {
              transactions = await this.parseJSON(file);
          } else {
              throw new Error('Unsupported file type');
          }

          // Validate transactions
          transactions = transactions.map(this.validateTransaction);

          // Call the onImport callback
          await this.onImport(transactions);
          
          this.showStatus('Import successful!', 'success');
          setTimeout(() => this.close(), 1500);
      } catch (error) {
          this.showStatus(`Import failed: ${error.message}`, 'error');
      }
  }

  async parseCSV(file) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (event) => {
              try {
                  const text = event.target.result;
                  const lines = text.split(/\r?\n/).filter(line => line.trim());
                  
                  if (lines.length < 2) {
                      throw new Error('CSV file is empty or invalid');
                  }

                  // Parse headers and validate
                  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                  const requiredHeaders = ['date', 'description', 'amount', 'type', 'context'];
                  
                  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                  if (missingHeaders.length > 0) {
                      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
                  }

                  // Parse transactions
                  const transactions = lines.slice(1).map(line => {
                      const values = line.split(',').map(v => v.trim());
                      const transaction = {};
                      headers.forEach((header, index) => {
                          transaction[header] = values[index];
                      });
                      return transaction;
                  });

                  resolve(transactions);
              } catch (error) {
                  reject(error);
              }
          };

          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(file);
      });
  }

  async parseJSON(file) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (event) => {
              try {
                  const data = JSON.parse(event.target.result);
                  if (!Array.isArray(data)) {
                      throw new Error('JSON must contain an array of transactions');
                  }
                  resolve(data);
              } catch (error) {
                  reject(new Error('Invalid JSON format'));
              }
          };

          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(file);
      });
  }

  validateTransaction(transaction) {
      // Validate date
      if (!transaction.date || !Date.parse(transaction.date)) {
          throw new Error('Invalid date format');
      }

      // Validate description
      if (!transaction.description || transaction.description.length < 1) {
          throw new Error('Description is required');
      }

      // Validate amount
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount) || amount <= 0) {
          throw new Error('Amount must be a positive number');
      }

      // Validate type
      const type = transaction.type.toLowerCase();
      if (!['income', 'expense'].includes(type)) {
          throw new Error('Type must be either "income" or "expense"');
      }

      // Validate context
      const context = transaction.context.toLowerCase();
      if (!['personal', 'home', 'salary'].includes(context)) {
          throw new Error('Context must be either "personal", "home" or "salary"');
      }

      return {
          date: transaction.date,
          description: transaction.description,
          amount,
          type,
          context
      };
  }

  showStatus(message, type = 'info') {
      const statusElement = document.getElementById('importStatus');
      if (statusElement) {
          statusElement.className = `import-status ${type}`;
          statusElement.textContent = message;
      }
  }

  close() {
      const modal = document.querySelector('.modal');
      if (modal) {
          modal.remove();
      }
  }
}