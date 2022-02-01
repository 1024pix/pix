import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';

export default class SessionsUpdateController extends Controller {
  @alias('model') session;

  get pageTitle() {
    return "Modification d'une session | Session ${this.session.id} | Pix Certif";
  }

  @action
  async updateSession(event) {
    event.preventDefault();
    await this.session.save();
    this.transitionToRoute('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.sessions.details', this.session.id);
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
