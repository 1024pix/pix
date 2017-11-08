const _ = require('lodash');

class Profile {
  constructor(user, competences, areas, assessments, courses, organizations) {
    this.user = user;
    this.competences = competences;
    this.areas = areas;
    this.organizations = organizations;
    this._initCompetenceLevel();
    this._setLevelAndPixScoreToCompetences(assessments, courses);
    this._calculateTotalPixScore();
    this._setAssessmentToCompetence(assessments, courses);
  }

  _initCompetenceLevel() {
    if (this.competences) {
      this.competences.forEach((competence) => competence['level'] = -1);
    }
  }

  _setLevelAndPixScoreToCompetences(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);

      if (assessment.isCompleted()) {
        const competence = this.competences.find(competence => course.competences.includes(competence.id));
        competence.level = assessment.get('estimatedLevel');
        competence.pixScore = assessment.get('pixScore');
      }
    });
  }

  _setAssessmentToCompetence(assessments, courses) {
    assessments.forEach(assessment => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);

      const competence = this.competences.find(competence => course.competences.includes(competence.id));
      competence.assessmentId = assessment.get('id');
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
