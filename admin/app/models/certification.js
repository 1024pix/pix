// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
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
  @belongsTo('complementary-certification-course-results-with-external')
  complementaryCertificationCourseResultsWithExternal;

  @hasMany('certification-issue-report') certificationIssueReports;
  @hasMany('common-complementary-certification-course-result') commonComplementaryCertificationCourseResults;

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

  get hasComplementaryCertifications() {
    return (
      Boolean(this.commonComplementaryCertificationCourseResults.length) ||
      Boolean(this.complementaryCertificationCourseResultsWithExternal.get('pixResult'))
    );
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

  editJuryLevel = memberAction({
    type: 'post',
    urlType: 'edit-jury-level',
    before(attributes) {
      return {
        data: {
          attributes,
        },
      };
    },
    after() {
      this.reload();
    },
  });
}
