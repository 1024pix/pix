import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SessionsNewController extends Controller {

  @alias('model') session;

  @action
  async createSession(event) {
    event.preventDefault();
    await this.session.save();
    this.transitionToRoute('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.sessions.list');
  }

  @action
  onDatePicked(selectedDates, lastSelectedDateFormatted) {
    this.session.date = lastSelectedDateFormatted;
  }

  @action
  onTimePicked(selectedTimes, lastSelectedTimeFormatted) {
    this.session.time = lastSelectedTimeFormatted;
  }
}
