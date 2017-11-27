const _ = require('lodash');

// FIXME: Cet objet a trop de responsabilité (modification des compétences)
class Profile {
  constructor(user, competences, areas, lastAssessments, assessmentsCompleted, courses, organizations) {
    this.user = user;
    this.competences = competences;
    this.areas = areas;
    this.organizations = organizations;

    this._setStatusToCompetences(lastAssessments, assessmentsCompleted, courses);
    this._setLevelAndPixScoreToCompetences(lastAssessments, courses);
    this._setAssessmentToCompetence(lastAssessments, courses);
    this._calculateTotalPixScore();
  }

  _setLevelAndPixScoreToCompetences(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);

      if (assessment.isCompleted()) {
        const competence = this.competences.find(competence => course.competences.includes(competence.id));
        competence.level = assessment.get('estimatedLevel');
        competence.pixScore = assessment.get('pixScore');
        if (competence.status === 'notCompleted') {
          competence.level = -1;
          delete competence.pixScore;
        }
      }
    });
  }

  _setStatusToCompetences(lastAssessments, assessmentsCompleted, courses) {
    this.competences.forEach((competence) => {
      const lastAssessmentByCompetenceId = this._findAssessmentsByCompetenceId(lastAssessments, courses, competence.id);
      const assessmentsCompletedByCompetenceId = this._findAssessmentsByCompetenceId(assessmentsCompleted, courses, competence.id);
      if (lastAssessmentByCompetenceId.length === 0) {
        competence.status = 'notEvaluated';
      } else {
        competence.status = this._getCompetenceStatus(lastAssessmentByCompetenceId,assessmentsCompletedByCompetenceId);
      }
    });
  }

  _getCompetenceStatus(lastAssessmentByCompetenceId, assessmentsCompletedByCompetenceId) {
    let status;
    if(this._assessementIsNotCompleted(lastAssessmentByCompetenceId[0])) {
      status = 'notCompleted';
    } else if (assessmentsCompletedByCompetenceId.length === 1) {
      status = 'evaluated';
    } else {
      status = 'replayed';
    }

    return status;
  }

  _assessementIsNotCompleted(assessment) {
    return (!assessment.get('pixScore') && !assessment.get('estimatedLevel')
      && assessment.get('pixScore') !== 0 && assessment.get('estimatedLevel') !== 0);
  }

  _setAssessmentToCompetence(assessments, courses) {
    assessments.forEach(assessment => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);
      const competence = this.competences.find(competence => course.competences.includes(competence.id));
      competence.assessmentId = assessment.get('id');
    });
  }

  _findAssessmentsByCompetenceId(assessments, courses, competenceId) {
    return assessments.filter((assessment) => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);
      return course.competences.indexOf(competenceId) > -1;
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
