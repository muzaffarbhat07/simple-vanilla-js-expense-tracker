export class ExportService {
    static exportToCSV(transactions) {
        const headers = ['Date', 'Description', 'Amount', 'Type', 'Context'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(transaction => [
                transaction.date,
                `"${transaction.description.replace(/"/g, '""')}"`,
                transaction.amount,
                transaction.type,
                transaction.context
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'transactions.csv', 'text/csv');
    }

    static exportToJSON(transactions) {
        const jsonContent = JSON.stringify(transactions, null, 2);
        this.downloadFile(jsonContent, 'transactions.json', 'application/json');
    }

    static downloadFile(content, fileName, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    static validateCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n');
                if (lines.length < 2) {
                    reject('File is empty or invalid');
                    return;
                }

                const headers = lines[0].toLowerCase().trim().split(',');
                const requiredHeaders = ['date', 'description', 'amount', 'type', 'context'];
                
                if (!requiredHeaders.every(h => headers.includes(h))) {
                    reject('Invalid CSV format: Missing required headers');
                    return;
                }

                resolve(true);
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        });
    }

    static validateJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data)) {
                        reject('Invalid JSON format: Not an array');
                        return;
                    }
                    resolve(true);
                } catch (error) {
                    reject('Invalid JSON format');
                }
            };
            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        });
    }
}