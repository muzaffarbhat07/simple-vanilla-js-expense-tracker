export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const groupByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
      const date = transaction.date.split('T')[0];
      if (!groups[date]) {
          groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
  }, {});
};