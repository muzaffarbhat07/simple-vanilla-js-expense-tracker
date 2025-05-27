export class TransactionForm {
  constructor(onSubmit) {
    this.onSubmit = onSubmit;
    this.form = null;
  }

  render() {
    const form = document.createElement('form');
    this.form = form;

    form.className = 'transaction-form';
    form.innerHTML = `
        <h2>Add New Transaction</h2>
            <div class="form-group">
                <label for="description">Description</label>
                <input type="text" id="description" required>
            </div>
            <div class="form-group">
                <label for="amount">Amount</label>
                <div class="input-group">
                    <span class="input-group-text">₹</span>
                    <input 
                        type="number" 
                        id="amount" 
                        required 
                        placeholder="0"
                    >
                </div>
            </div>
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" required>
            </div>
            <div class="form-group">
                <label for="type">Type</label>
                <select id="type" required>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
            </div>
            <div class="form-group">
            <label for="context">Context</label>
            <select id="context" required>
                <option value="personal">Personal</option>
                <option value="home">Home</option>
                <option value="salary">Salary</option>
            </select>
            </div>
            <button type="submit" class="btn btn-primary">Add Transaction</button>
        </h2>
    `;

    form.addEventListener('submit', this.handleSubmit.bind(this));
    return form;
  }

  clearForm() {
    if (this.form) {
        this.form.reset();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.onSubmit({
        description: e.target.description.value,
        amount: parseInt(e.target.amount.value),
        date: e.target.date.value,
        type: e.target.type.value,
        context: e.target.context.value,
    });
    e.target.reset();
  }
}