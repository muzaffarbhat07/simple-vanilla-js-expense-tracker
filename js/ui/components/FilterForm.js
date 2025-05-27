export class FilterForm {
  constructor(onSubmit) {
      this.onSubmit = onSubmit;
      this.selectedContexts = new Set();
      this.form = null;
  }

  render() {
      const form = document.createElement('div');
      this.form = form;

      form.className = 'filters';
      form.innerHTML = `
        <h2>Filter Transactions</h2>
            <div class="date-range">
                <div class="form-group">
                    <label for="startDate">From</label>
                    <input type="date" id="startDate">
                </div>
                <div class="form-group">
                    <label for="endDate">To</label>
                    <input type="date" id="endDate">
                </div>
            </div>
            <div class="form-group">
                <label>Context</label>
                <div class="context-filters">
                    <label class="checkbox-label">
                        <input type="checkbox" value="personal" class="context-checkbox">
                        Personal
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" value="home" class="context-checkbox">
                        Home
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" value="salary" class="context-checkbox">
                        Salary
                    </label>
                </div>
            </div>
            <button type="button" class="btn btn-primary" id="applyFilters">Apply Filters</button>
            <button type="button" class="btn btn-secondary" id="clearFilters">Clear Filters</button>
        </h2>
      `;

      this.attachEventListeners(form);
      return form;
  }

  clearForm() {
      if (this.form) {
          const startDate = this.form.querySelector('#startDate');
          const endDate = this.form.querySelector('#endDate');
          if (startDate) startDate.value = '';
          if (endDate) endDate.value = '';
      }
}

  attachEventListeners(form) {
    const applyBtn = form.querySelector('#applyFilters');
    const clearBtn = form.querySelector('#clearFilters');
    const contextCheckboxes = form.querySelectorAll('.context-checkbox');
    const startDate = form.querySelector('#startDate');
    const endDate = form.querySelector('#endDate');

    applyBtn.addEventListener('click', () => {
        this.onSubmit({
            startDate: startDate.value,
            endDate: endDate.value,
            contexts: Array.from(this.selectedContexts)
        });
    });

    clearBtn.addEventListener('click', () => {
        startDate.value = '';
        endDate.value = '';
        contextCheckboxes.forEach(cb => cb.checked = false);
        this.selectedContexts.clear();
        this.onSubmit({});
    });

    contextCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedContexts.add(e.target.value);
            } else {
                this.selectedContexts.delete(e.target.value);
            }
        });
    });
  }
}