import Model, { attr } from '@ember-data/model';

export const ACQUIRED = 'acquired';
export const REJECTED = 'rejected';
export const NOT_PASSED = 'not_passed';
export const partnerCertificationStatusToDisplayName = {
  [ACQUIRED]: 'Validée',
  [REJECTED]: 'Rejetée',
  [NOT_PASSED]: 'Non passée',
};

export default class Certification extends Model {

  @attr() sessionId;
  @attr() assessmentId;
  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() birthplace;
  @attr() externalId;
  @attr() createdAt;
  @attr() completedAt;
  @attr() status;
  @attr() juryId;
  @attr('boolean') hasSeenEndTestScreen;
  @attr('string') examinerComment;
  @attr('string') commentForCandidate;
  @attr('string') commentForOrganization;
  @attr('string') commentForJury;
  @attr() pixScore;
  @attr() competencesWithMark;
  @attr('boolean', { defaultValue: false }) isPublished;
  @attr('boolean', { defaultValue: false }) isV2Certification;
  @attr() cleaCertificationStatus;

  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }

  get isCleaCertificationIsAcquired() {
    return this.cleaCertificationStatus === ACQUIRED;
  }

  get isCleaCertificationIsRejected() {
    return this.cleaCertificationStatus === REJECTED;
  }

  saveCompetenceMarks() {
    return this.save({ adapterOptions: { updateMarks: true } });
  }

  saveWithoutUpdatingCompetenceMarks() {
    return this.save({ adapterOptions: { updateMarks: false } });
  }
}
