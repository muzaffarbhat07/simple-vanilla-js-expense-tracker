export class DateService {
  static isValidDateRange(startDate, endDate) {
      if (!startDate || !endDate) return true;
      return new Date(startDate) <= new Date(endDate);
  }

  static formatForInput(date) {
      return date.toISOString().split('T')[0];
  }

  static getCurrentDate() {
      return this.formatForInput(new Date());
  }

  static isWithinRange(date, startDate, endDate) {
      const checkDate = new Date(date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
          return checkDate >= start && checkDate <= end;
      }
      if (start) {
          return checkDate >= start;
      }
      if (end) {
          return checkDate <= end;
      }
      return true;
  }
}