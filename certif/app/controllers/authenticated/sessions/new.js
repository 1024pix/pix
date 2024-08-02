import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import isEmpty from 'lodash/isEmpty';

export default class SessionsNewController extends Controller {
  @alias('model') session;
  @service router;
  @service intl;
  @service notifications;

  @tracked isSessionDateMissing;
  @tracked isSessionTimeMissing;
  @tracked address;
  @tracked room;
  @tracked examiner;

  get pageTitle() {
    return this.intl.t('pages.sessions.new.extra-information');
  }

  get currentLocale() {
    return this.intl.primaryLocale;
  }

  @action
  async createSession(event) {
    event.preventDefault();
    if (this.checkMissingSessionFields())
      return this.notifications.error(this.intl.t('common.form-errors.fill-mandatory-fields'));
    try {
      await this.session.save();
    } catch (responseError) {
      const error = responseError?.errors?.[0];

      if (error?.code) {
        return this.notifications.error(this.intl.t(`common.api-error-messages.${error.code}`));
      }
      if (error?.status === '400') {
        return this.notifications.error(this.intl.t('common.api-error-messages.bad-request-error'));
      }
      return this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
    this.router.transitionTo('authenticated.sessions.details', this.session.id);
  }

  @action
  cancel() {
    this.isSessionDateMissing = false;
    this.isSessionTimeMissing = false;
    this.router.transitionTo('authenticated.sessions.list');
  }

  @action
  onChangeAddress(event) {
    this.session.address = event.target.value;
  }

  @action
  onChangeRoom(event) {
    this.session.room = event.target.value;
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
  }

  @action
  onChangeDescription(event) {
    this.session.description = event.target.value;
  }

  @action
  validateInput(input) {
    this[input] = null;
    const value = this.session[input];

    const isInvalidInput = isEmpty(value?.trim());
    if (isInvalidInput) {
      this[input] = this.intl.t(`pages.sessions.new.errors.SESSION_${input.toUpperCase()}_REQUIRED`);
    }
  }

  checkMissingSessionFields() {
    this.isSessionDateMissing = !this.session.date;
    this.isSessionTimeMissing = !this.session.time;

    return (
      this.isSessionDateMissing ||
      this.isSessionTimeMissing ||
      !this.session.address?.trim() ||
      !this.session.room?.trim() ||
      !this.session.examiner?.trim()
    );
  }
}
