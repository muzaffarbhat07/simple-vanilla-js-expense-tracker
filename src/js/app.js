import { TransactionService } from './services/TransactionService.js';
import { UIService } from './ui/UIService.js';

class App {
    constructor() {
        this.transactionService = new TransactionService();
        this.uiService = new UIService(this.transactionService);
    }
}

// Initialize app
const app = new App();
window.app = app; // For debugging purposes