import Controller from '@ember/controller';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
/* eslint-enable ember/no-computed-properties-in-native-classes*/
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CertificationCandidatesController extends Controller {
  @service currentUser;
  @service intl;
  @service notifications;
  @service fileSaver;
  @service session;

  @alias('model.session') currentSession;
  @alias('model.certificationCandidates') certificationCandidates;
  @alias('model.reloadCertificationCandidate') reloadCertificationCandidate;
  @alias('model.countries') countries;

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.candidates.page-title')} | Session ${
      this.currentSession.id
    } | Pix Certif`;
  }

  @computed('certificationCandidates', 'certificationCandidates.@each.isLinked')
  get importAllowed() {
    return this.certificationCandidates.every((certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }

  @computed('model.certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.model.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  get shouldDisplayPrescriptionScoStudentRegistrationFeature() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  @action
  async fetchCandidatesImportTemplate() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.model.session.urlToDownloadCandidatesImportTemplate, token });
    } catch (err) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  @action
  async reloadCertificationCandidateInController() {
    await this.reloadCertificationCandidate();
  }

  get shouldDisplayComplementaryCertificationsHabilitations() {
    return this.currentUser.currentAllowedCertificationCenterAccess.hasHabilitations;
  }

  get shouldDisplayPaymentOptions() {
    return this._currentCertificationCenterIsNotSco();
  }

  _currentCertificationCenterIsNotSco() {
    return !this.currentUser.currentAllowedCertificationCenterAccess.isSco;
  }
}
