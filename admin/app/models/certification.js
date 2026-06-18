import { service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_INVIGILATOR: 'endedByInvigilator',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};

export const assessmentResultStatus = {
  CANCELLED: 'cancelled',
  CANCELLED_BY_JURY: 'cancelled_by_jury',
  ERROR: 'error',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
};

export const certificationStatuses = [
  { value: assessmentResultStatus.CANCELLED, label: 'Annulée' },
  { value: assessmentResultStatus.CANCELLED_BY_JURY, label: 'Annulée par le jury' },
  { value: assessmentStates.STARTED, label: 'Démarrée' },
  { value: assessmentResultStatus.ERROR, label: 'En erreur' },
  { value: assessmentResultStatus.VALIDATED, label: 'Validée' },
  { value: assessmentResultStatus.REJECTED, label: 'Rejetée' },
];

export default class Certification extends Model {
  @service intl;

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
  @attr() isRejectedForFraud;
  @attr() status;
  @attr() juryId;
  @attr('string') commentForCandidate;
  @attr('string') commentForOrganization;
  @attr('string') commentByJury;
  @attr() pixScore;
  @attr() reachedResultKey;
  @attr() competencesWithMark;
  @attr('boolean', { defaultValue: false }) isPublished;
  @attr('number') version;
  @attr('string') certificationFramework;
  @attr() lastAnswerAt;

  @belongsTo('complementary-certification-course-result-with-external', { async: true, inverse: null })
  complementaryCertificationCourseResultWithExternal;
  @belongsTo('common-complementary-certification-course-result', { async: true, inverse: null })
  commonComplementaryCertificationCourseResult;

  @hasMany('certification-issue-report', { async: true, inverse: 'certification' }) certificationIssueReports;

  get creationDate() {
    return this.createdAt ? this.intl.formatDate(this.createdAt, { format: 'long' }) : null;
  }

  get lastAnswerDate() {
    return this.lastAnswerAt ? this.intl.formatDate(this.lastAnswerAt, { format: 'long' }) : null;
  }

  get certificationType() {
    return this.intl.t(
      `pages.certifications.certification.certification-types-v${this.version}.${this.certificationFramework}`,
    );
  }

  get statusLabelAndValue() {
    return certificationStatuses.find((certificationStatus) => certificationStatus.value === this.status);
  }

  get publishedText() {
    const value = this.isPublished;
    return value ? 'Oui' : 'Non';
  }

  get isCertificationCancelled() {
    return this.status === assessmentResultStatus.CANCELLED || this.status === assessmentResultStatus.CANCELLED_BY_JURY;
  }

  get indexedCompetences() {
    const competencesWithMarks = this.competencesWithMark;
    return competencesWithMarks.reduce((result, value) => {
      result[value.competence_code] = { index: value.competence_code, level: value.level, score: value.score };
      return result;
    }, {});
  }

  get competences() {
    const indexedCompetences = this.indexedCompetences;
    return Object.keys(indexedCompetences)
      .sort()
      .reduce((result, value) => {
        result.push(indexedCompetences[value]);
        return result;
      }, []);
  }

  get isV3() {
    return this.version === 3;
  }

  get result() {
    return this.intl.t(`common.certification.meshLevels.${this.reachedResultKey}`, {
      pixScore: this.pixScore,
    });
  }

  get isPixPlusEdu() {
    return ['EDU_1ER_DEGRE', 'EDU_2ND_DEGRE', 'EDU_CPE'].includes(this.certificationFramework);
  }

  wasBornInFrance() {
    return this.birthCountry?.toUpperCase() === 'FRANCE';
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
}
