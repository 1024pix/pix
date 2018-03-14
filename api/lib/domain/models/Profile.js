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
      const courseIdFromAssessment = assessment.courseId;
      const course = this._getCourseById(courses, courseIdFromAssessment);

      if (assessment.isCompleted()) {
        const assessmentResult = assessment.getLastAssessmentResult();
        const competence = this.competences.find(competence => course.competences.includes(competence.id));
        competence.level = assessmentResult.level;
        competence.pixScore = assessmentResult.pixScore;
        // TODO: Standardiser l'usage de status pour une compétence
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
    if(!lastAssessmentByCompetenceId[0].isCompleted()) {
      status = 'notCompleted';
    } else if (assessmentsCompletedByCompetenceId.length === 1) {
      status = 'evaluated';
    } else {
      status = 'replayed';
    }

    return status;
  }

  _setAssessmentToCompetence(assessments, courses) {
    assessments.forEach(assessment => {
      const courseIdFromAssessment = assessment.courseId;
      const course = this._getCourseById(courses, courseIdFromAssessment);
      if(course) {
        const competence = this.competences.find(competence => course.competences.includes(competence.id));
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
