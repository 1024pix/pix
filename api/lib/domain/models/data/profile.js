const _ = require('lodash');

class Profile {
  constructor(user, competences, areas, assessments, courses) {
    this.user = user;
    this.competences = competences;
    this.areas = areas;
    this._initCompetenceLevel();
    this._setLevelAndPixScoreToCompetences(assessments, courses);
    this._calculateTotalPixScore();
  }

  _initCompetenceLevel() {
    if(this.competences) {
      this.competences.forEach((competence) => competence['level'] = -1);
    }
  }

  _setLevelAndPixScoreToCompetences(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseIdFromAssessment = assessment.get('courseId');
      const course = this._getCourseById(courses, courseIdFromAssessment);
      const estimateLevel = assessment.get('estimatedLevel');
      const pixScore = assessment.get('pixScore');

      this.competences.filter((competence) => {
        return course.competences.indexOf(competence.id) > -1;
      }).map((competence) => {
        competence.level = estimateLevel;
        competence.pixScore = pixScore;
        return competence;
      });

    });
  }

  _getCourseById(courses, courseIdFromAssessment) {
    return _.find(courses, function(course) {
      return course.id === courseIdFromAssessment;
    });
  }

  _calculateTotalPixScore() {

    const competencesWithScore = _.filter(this.competences, (competence) => {
      return competence.hasOwnProperty('pixScore');
    });

    if(competencesWithScore.length > 0) {
      let pixScore = 0;

      competencesWithScore.forEach((competence) => {
        pixScore += competence.pixScore;
      });

      this.user.set('pix-score', pixScore);
    }
  }
}

module.exports = Profile;
