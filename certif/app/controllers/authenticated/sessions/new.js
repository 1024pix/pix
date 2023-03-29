import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SessionsNewController extends Controller {
  @alias('model') session;
  @service router;
  @service intl;

  @tracked isSessionDateMissing;
  @tracked isSessionTimeMissing;

  get pageTitle() {
    return this.intl.t('pages.sessions.new.extra-information');
  }

  @action
  async createSession(event) {
    event.preventDefault();
    if (!this.session.date) {
      this.isSessionDateMissing = true;
    }
    if (!this.session.time) {
      this.isSessionTimeMissing = true;
    }
    if (this.isSessionDateMissing || this.isSessionTimeMissing) return;
    await this.session.save();
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.sessions.list');
  }

  @action
  onDatePicked(selectedDates, lastSelectedDateFormatted) {
    this.session.date = lastSelectedDateFormatted;
    this.isSessionDateMissing = false;
  }

  @action
  onTimePicked(selectedTimes, lastSelectedTimeFormatted) {
    this.session.time = lastSelectedTimeFormatted;
    this.isSessionTimeMissing = false;
  }
}
