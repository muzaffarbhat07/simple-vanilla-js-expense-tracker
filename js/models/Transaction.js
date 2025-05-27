export class Transaction {
  constructor(description, amount, date, type, context) {
    this.id = Date.now();
    this.description = description;
    this.amount = amount;
    this.date = date;
    this.type = type;
    this.context = context;
    this.createdAt = new Date();
  }

  validate() {
    if (!this.description || !this.amount || !this.date || !this.type || !this.context) {
        throw new Error('All fields are required');
    }
    if (this.amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }
  }
}