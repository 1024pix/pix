import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class SessionsUpdateController extends Controller {
  @alias('model') session;
  @service router;
  @service intl;
  @service notifications;

  @tracked isSessionAddressMissing;
  @tracked isSessionRoomMissing;
  @tracked isSessionDateMissing;
  @tracked isSessionTimeMissing;
  @tracked isSessionExaminerMissing;

  get pageTitle() {
    return `${this.intl.t('pages.sessions.update.title')} | Session ${this.session.id} | Pix Certif`;
  }

  get currentLocale() {
    return this.intl.locale[0];
  }

  @action
  async updateSession(event) {
    event.preventDefault();
    if (this.checkMissingSessionFields()) return;
    try {
      await this.session.save();
    } catch (responseError) {
      const error = responseError?.errors?.[0];

      if (error?.code) {
        return this.notifications.error(this.intl.t(`common.api-error-messages.${error.code}`));
      }
      if (_isEntityUnprocessable(responseError)) {
        return this.notifications.error(this.intl.t('common.api-error-messages.bad-request-error'));
      }
      return this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  onChangeAddress(event) {
    this.session.address = event.target.value;
    this.isSessionAddressMissing = false;
  }

  @action
  onChangeRoom(event) {
    this.session.room = event.target.value;
    this.isSessionRoomMissing = false;
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

  @action
  onChangeExaminer(event) {
    this.session.examiner = event.target.value;
    this.isSessionExaminerMissing = false;
  }

  checkMissingSessionFields() {
    this.isSessionAddressMissing = !this.session.address;
    this.isSessionRoomMissing = !this.session.room;
    this.isSessionDateMissing = !this.session.date;
    this.isSessionTimeMissing = !this.session.time;
    this.isSessionExaminerMissing = !this.session.examiner;

    return (
      this.isSessionAddressMissing ||
      this.isSessionRoomMissing ||
      this.isSessionDateMissing ||
      this.isSessionTimeMissing ||
      this.isSessionExaminerMissing
    );
  }
}

function _isEntityUnprocessable(err) {
  const status = get(err, 'errors[0].status');
  return status === '422' || status === '400';
}
