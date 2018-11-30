const _ = require('lodash');
const moment = require('moment');
const { MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS } = require('./Assessment');

const competenceStatus = {
  NOT_ASSESSED: 'notAssessed',
  ASSESSMENT_NOT_COMPLETED: 'assessmentNotCompleted',
  ASSESSED: 'assessed',
  UNKNOWN: 'unknown',
};

// FIXME: Cet objet a trop de responsabilité (modification des compétences)
class Profile {
  constructor({
    // attributes
    // includes
    areas,
    assessmentsCompletedWithResults,
    competences,
    courses,
    lastAssessments,
    organizations,
    user,
    // references
  } = {}) {
    // attributes
    // includes
    this.areas = areas;
    this.competences = competences;
    this.organizations = organizations;
    this.user = user;
    // references

    this._setStatusToCompetences(lastAssessments, assessmentsCompletedWithResults, courses);
    this._setLevelAndPixScoreToCompetences(lastAssessments, courses);
    this._setAssessmentToCompetence(lastAssessments, courses);
    this._calculateTotalPixScore();
  }

  _setStatusToCompetences(lastAssessments, assessmentsCompletedWithResults, courses) {
    this.competences.forEach((competence) => {

      const lastAssessmentByCompetenceId = this._findAssessmentsByCompetenceId(lastAssessments, courses, competence.id);
      const assessmentsCompletedByCompetenceId = this._findAssessmentsByCompetenceId(assessmentsCompletedWithResults, courses, competence.id);

      if (lastAssessmentByCompetenceId.length === 0) {
        competence.status = competenceStatus.NOT_ASSESSED;
      } else if (!lastAssessmentByCompetenceId[0].isCompleted()) {
        competence.status = competenceStatus.ASSESSMENT_NOT_COMPLETED;
      } else if (assessmentsCompletedByCompetenceId.length >= 1) {
        competence.status = competenceStatus.ASSESSED;
        this._setDaysBeforeNewAttemptToCompetence(competence, assessmentsCompletedByCompetenceId);
      } else {
        competence.status = competenceStatus.UNKNOWN;
      }

    });
  }

  _daysBeforeNewAttempt(daysSinceLastCompletedAssessment) {
    if(daysSinceLastCompletedAssessment >= MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS)
      return 0;

    return Math.ceil(MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS - daysSinceLastCompletedAssessment);
  }

  _setDaysBeforeNewAttemptToCompetence(competence, assessmentsCompletedByCompetenceId) {
    const lastAssessmentResult = _(assessmentsCompletedByCompetenceId)
      .map((assessment) => assessment.assessmentResults)
      .flatten()
      .sortBy(['createdAt'])
      .first();

    const daysSinceLastCompletedAssessment = moment().diff(lastAssessmentResult.createdAt, 'days', true);
    competence.daysBeforeNewAttempt = this._daysBeforeNewAttempt(daysSinceLastCompletedAssessment);
  }

  _setLevelAndPixScoreToCompetences(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseIdFromAssessment = assessment.courseId;
      const course = this._getCourseById(courses, courseIdFromAssessment);

      if (assessment.isCompleted()) {
        const competence = this.competences.find((competence) => course.competences.includes(competence.id));
        competence.level = assessment.getLevel();
        competence.pixScore = assessment.getPixScore();
        // TODO: Standardiser l'usage de status pour une compétence
        if (competence.status === competenceStatus.ASSESSMENT_NOT_COMPLETED) {
          competence.level = -1;
          delete competence.pixScore;
        }
      }
    });
  }

  _setAssessmentToCompetence(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseIdFromAssessment = assessment.courseId;
      const course = this._getCourseById(courses, courseIdFromAssessment);
      if (course) {
        const competence = this.competences.find((competence) => course.competences.includes(competence.id));
        competence.assessmentId = assessment.id;
      }
    });
  }

  _findAssessmentsByCompetenceId(assessments, courses, competenceId) {
    return assessments.filter((assessment) => {
      const courseIdFromAssessment = assessment.courseId;
      const course = this._getCourseById(courses, courseIdFromAssessment);
      return course ? course.competences.includes(competenceId) : false;
    });
  }

  _getCourseById(courses, courseIdFromAssessment) {
    return _.find(courses, (course) => {
      return course.id === courseIdFromAssessment;
    });
  }

  _calculateTotalPixScore() {
    const competencesWithScore = _.filter(this.competences, (competence) => {
      return competence.hasOwnProperty('pixScore');
    });

    if (competencesWithScore.length > 0) {
      let pixScore = 0;

      competencesWithScore.forEach((competence) => {
        pixScore += competence.pixScore;
      });

      this.user.set('pix-score', pixScore);
    }
  }
}

module.exports = Profile;
