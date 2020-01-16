import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RoutesAuthenticatedSessionsNewItem extends Component {

  @action
  onDatePicked(selectedDates, lastSelectedDateFormatted) {
    this.args.session.date = lastSelectedDateFormatted;
  }

  @action
  onTimePicked(selectedTimes, lastSelectedTimeFormatted) {
    this.args.session.time = lastSelectedTimeFormatted;
  }
}
