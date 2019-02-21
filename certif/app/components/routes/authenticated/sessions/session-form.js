import Component from '@ember/component';

export default Component.extend({
  isNewSession: false,

  onDatePicked(selectedDates, lastSelectedDateFormatted) {
    this.set('session.date', lastSelectedDateFormatted);
  },

  onTimePicked(selectedTimes, lastSelectedTimeFormatted) {
    this.set('session.time', lastSelectedTimeFormatted);
  }
});
