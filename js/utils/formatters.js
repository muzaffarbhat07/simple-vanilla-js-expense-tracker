import { CONFIG } from '../constants/config.js';

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat(CONFIG.LOCALE, {
        style: 'currency',
        currency: CONFIG.CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// For displaying without currency symbol (if needed)
export const formatNumber = (amount) => {
    return new Intl.NumberFormat(CONFIG.LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// For input field formatting (if needed)
export const formatForInput = (amount) => {
    return amount.toFixed(2);
};

export const parseAmount = (value) => {
    // Remove currency symbol, commas and spaces
    const cleanValue = value.replace(/[₹,\s]/g, '');
    return parseFloat(cleanValue);
};