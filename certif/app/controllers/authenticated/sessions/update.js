import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class SessionsUpdateController extends Controller {
  @alias('model') session;
  @service router;
  @service intl;

  get pageTitle() {
    return `${this.intl.t('pages.sessions.update.page-title')} | Session ${this.session.id} | Pix Certif`;
  }

  @action
  async updateSession(event) {
    event.preventDefault();
    await this.session.save();
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
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
