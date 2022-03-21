// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export const ACQUIRED = 'acquired';
export const REJECTED = 'rejected';
export const NOT_TAKEN = 'not_taken';
export const partnerCertificationStatusToDisplayName = {
  [ACQUIRED]: 'Validée',
  [REJECTED]: 'Rejetée',
};
export const STARTED = 'started';
export const ERROR = 'error';
export const certificationStatuses = [
  { value: STARTED, label: 'Démarrée' },
  { value: ERROR, label: 'En erreur' },
  { value: 'validated', label: 'Validée' },
  { value: 'rejected', label: 'Rejetée' },
  { value: 'cancelled', label: 'Annulée' },
];

export default class Certification extends Model {
  @attr() sessionId;
  @attr() assessmentId;
  @attr() userId;
  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() sex;
  @attr() birthplace;
  @attr() birthCountry;
  @attr() birthInseeCode;
  @attr() birthPostalCode;
  @attr() createdAt;
  @attr() completedAt;
  @attr() status;
  @attr() juryId;
  @attr('string') commentForCandidate;
  @attr('string') commentForOrganization;
  @attr('string') commentForJury;
  @attr() pixScore;
  @attr() competencesWithMark;
  @attr('boolean', { defaultValue: false }) isPublished;
  @attr() cleaCertificationStatus;
  @attr() pixPlusDroitMaitreCertificationStatus;
  @attr() pixPlusDroitExpertCertificationStatus;
  @attr() pixPlusEduInitieCertificationStatus;
  @attr() pixPlusEduConfirmeCertificationStatus;
  @attr() pixPlusEduAvanceCertificationStatus;
  @attr() pixPlusEduExpertCertificationStatus;

  @hasMany('certification-issue-report') certificationIssueReports;

  @computed('createdAt')
  get creationDate() {
    return new Date(this.createdAt).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return this.completedAt ? new Date(this.completedAt).toLocaleString('fr-FR') : null;
  }

  @computed('status')
  get statusLabelAndValue() {
    return certificationStatuses.find((certificationStatus) => certificationStatus.value === this.status);
  }

  @computed('isPublished')
  get publishedText() {
    const value = this.isPublished;
    return value ? 'Oui' : 'Non';
  }

  @computed('competencesWithMark')
  get indexedCompetences() {
    const competencesWithMarks = this.competencesWithMark;
    return competencesWithMarks.reduce((result, value) => {
      result[value.competence_code] = { index: value.competence_code, level: value.level, score: value.score };
      return result;
    }, {});
  }

  @computed('indexedCompetences')
  get competences() {
    const indexedCompetences = this.indexedCompetences;
    return Object.keys(indexedCompetences)
      .sort()
      .reduce((result, value) => {
        result.push(indexedCompetences[value]);
        return result;
      }, []);
  }

  @computed('cleaCertificationStatus')
  get cleaCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.cleaCertificationStatus];
  }

  @computed('pixPlusDroitMaitreCertificationStatus')
  get pixPlusDroitMaitreCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusDroitMaitreCertificationStatus];
  }

  @computed('pixPlusDroitExpertCertificationStatus')
  get pixPlusDroitExpertCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusDroitExpertCertificationStatus];
  }

  @computed('pixPlusEduInitieCertificationStatus')
  get pixPlusEduInitieCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusEduInitieCertificationStatus];
  }
  @computed('pixPlusEduConfirmeCertificationStatus')
  get pixPlusEduConfirmeCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusEduConfirmeCertificationStatus];
  }
  @computed('pixPlusEduAvanceCertificationStatus')
  get pixPlusEduAvanceCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusEduAvanceCertificationStatus];
  }
  @computed('pixPlusEduExpertCertificationStatus')
  get pixPlusEduExpertCertificationStatusLabel() {
    return partnerCertificationStatusToDisplayName[this.pixPlusEduExpertCertificationStatus];
  }

  get wasRegisteredBeforeCPF() {
    return !this.sex;
  }

  wasBornInFrance() {
    return this.birthCountry === 'FRANCE';
  }

  getInformation() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      birthplace: this.birthplace,
      sex: this.sex,
      birthInseeCode: this.birthInseeCode,
      birthPostalCode: this.birthPostalCode,
      birthCountry: this.birthCountry,
    };
  }

  updateInformation({
    firstName,
    lastName,
    birthdate,
    birthplace,
    sex,
    birthInseeCode,
    birthPostalCode,
    birthCountry,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.sex = sex;
    this.birthInseeCode = birthInseeCode;
    this.birthPostalCode = birthPostalCode;
    this.birthCountry = birthCountry;
  }

  cancel = memberAction({
    type: 'post',
    urlType: 'cancel',
  });

  uncancel = memberAction({
    type: 'post',
    urlType: 'uncancel',
  });
}
