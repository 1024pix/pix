import Component from '@ember/component';

export default Component.extend({

  onDatePicked(selectedDates, lastSelectedDateFormatted) {
    this.set('session.date', lastSelectedDateFormatted);
  },

  onTimePicked(selectedTimes, lastSelectedTimeFormatted) {
    this.set('session.time', lastSelectedTimeFormatted);
  }
});
