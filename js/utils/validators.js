export const validators = {
  isPositiveNumber(value) {
      return !isNaN(value) && value > 0;
  },

  isValidDate(date) {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d);
  },

  isValidDescription(description) {
      return description.trim().length >= 3;
  },

  isValidType(type) {
      return ['income', 'expense'].includes(type);
  }
};