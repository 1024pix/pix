import Component from '@ember/component';

export default Component.extend({

  classNames: ['date-input'],

  day: '',
  month: '',
  year: '',

  init() {
    this._super(...arguments);
    this.set('id', Math.random().toString().slice(2));
  },

  actions: {

    handleInputChange(inputKey, inputValueBefore, event) {
      const keyPressed = event.key;
      const { value } = event.target;

      if (inputKey === 'day') {
        this.day = value;

        if (value.length === 2) {
          document.getElementById(`input-month__${this.id}`).focus();
        }
      }
      else if (inputKey === 'month') {
        const switchToPreviousInput = keyPressed === 'Backspace' && !inputValueBefore;
        this.month = value;

        if (value.length === 2) {
          document.getElementById(`input-year__${this.id}`).focus();
        }
        if (switchToPreviousInput) {
          document.getElementById(`input-day__${this.id}`).focus();
        }
      }
      else {
        const switchToPreviousInput = keyPressed === 'Backspace' && !inputValueBefore;
        this.year = value;
        if (switchToPreviousInput) {
          document.getElementById(`input-month__${this.id}`).focus();
        }
      }

      if (this.day.length === 2 && this.month.length > 0 && this.year.length === 4) {
        const date = `${this.year}-${this.month}-${this.day}`;

        this.onSubmit(date);
      }
    },

  },

});
