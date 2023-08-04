import fetch from 'fetch';

import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { CONNECTION_TYPES } from '../../helpers/connection-types';
import ENV from 'pix-orga/config/environment';

export default class ScoList extends Component {
  @service currentUser;
  @service notifications;
  @service intl;
  @service store;
  @service session;
  @service fileSaver;

  @tracked isLoadingDivisions;
  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;
  @tracked showResetPasswordModal = false;

  @tracked affectedStudents = [];

  constructor() {
    super(...arguments);

    this.isLoadingDivisions = true;
    this.currentUser.organization.divisions.then(() => {
      this.isLoadingDivisions = false;
    });
  }

  get divisions() {
    return this.currentUser.organization.divisions.map(({ name }) => ({
      label: name,
      value: name,
    }));
  }

  get connectionTypes() {
    return CONNECTION_TYPES;
  }

  get connectionTypesOptions() {
    return [
      { value: 'none', label: this.intl.t(CONNECTION_TYPES.none) },
      { value: 'email', label: this.intl.t(CONNECTION_TYPES.email) },
      { value: 'identifiant', label: this.intl.t(CONNECTION_TYPES.identifiant) },
      { value: 'mediacentre', label: this.intl.t(CONNECTION_TYPES.mediacentre) },
      { value: 'without_mediacentre', label: this.intl.t(CONNECTION_TYPES.without_mediacentre) },
    ];
  }

  get showCheckbox() {
    return this.currentUser?.organization.type === 'SCO' && this.currentUser?.organization.isManagingStudents;
  }

  get headerId() {
    return guidFor(this) + 'mainCheckbox';
  }

  get actionBarId() {
    return guidFor(this) + 'actionBar';
  }

  get paginationControlId() {
    return guidFor(this) + 'paginationCOntrol';
  }

  get hasStudents() {
    return Boolean(this.args.students.length);
  }

  @action
  openAuthenticationMethodModal(student, event) {
    event.stopPropagation();
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  openResetPasswordModal(students, event) {
    event.stopPropagation();
    this.affectedStudents = students.filter((student) => student.authenticationMethods.includes('identifiant'));
    this.showResetPasswordModal = true;
  }

  @action
  closeResetPasswordModal() {
    this.showResetPasswordModal = false;
  }

  @action
  async resetPasswordForStudents(affectedStudents, resetSelectedStudents) {
    const affectedStudentsIds = affectedStudents.map((affectedStudents) => affectedStudents.id);
    try {
      await this.store.adapterFor('sco-organization-participant').resetOrganizationLearnersPassword({
        fetch,
        fileSaver: this.fileSaver,
        organizationId: this.currentUser.organization.id,
        organizationLearnersIds: affectedStudentsIds,
        token: this.session?.data?.authenticated?.access_token,
      });
      this.closeResetPasswordModal();
      resetSelectedStudents();
      this.notifications.sendSuccess(
        this.intl.t('pages.sco-organization-participants.messages.password-reset-success'),
      );
    } catch (fetchErrors) {
      const error = Array.isArray(fetchErrors) && fetchErrors.length > 0 && fetchErrors[0];
      let errorMessage;
      switch (error?.code) {
        case 'USER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.user-does-not-belong-to-organization-error',
          );
          break;
        case 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.organization-learner-does-not-belong-to-organization-error',
          );
          break;
        case 'ORGANIZATION_LEARNER_WITHOUT_USERNAME':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.organization-learner-without-username-error',
          );
          break;
        default:
          errorMessage = this.intl.t(this._getI18nKeyByStatus(error.status));
      }
      this.notifications.sendError(errorMessage);
    }
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }

  @action
  addStopPropagationOnFunction(toggleStudent, event) {
    event.stopPropagation();
    toggleStudent();
  }
}
