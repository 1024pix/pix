import Controller from '@ember/controller';
import every from 'lodash/every';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
/* eslint-enable ember/no-computed-properties-in-native-classes*/
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CertificationCandidatesController extends Controller {
  @service featureToggles;
  @service currentUser;

  @alias('model.session') currentSession;
  @alias('model.certificationCandidates') certificationCandidates;
  @alias('model.reloadCertificationCandidate') reloadCertificationCandidate;
  @alias('model.countries') countries;

  get pageTitle() {
    return `Candidats | Session ${this.currentSession.id} | Pix Certif`;
  }

  @computed('certificationCandidates', 'certificationCandidates.@each.isLinked')
  get importAllowed() {
    return every(this.certificationCandidates.toArray(), (certificationCandidate) => {
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
  async reloadCertificationCandidateInController() {
    await this.reloadCertificationCandidate();
  }

  get shouldDisplayComplementaryCertifications() {
    return (
      this.featureToggles.featureToggles.isComplementaryCertificationSubscriptionEnabled &&
      this.currentUser.currentAllowedCertificationCenterAccess.hasHabilitations
    );
  }
}
