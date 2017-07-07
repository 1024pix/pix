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
    if (this.competences) {
      this.competences.forEach((competence) => competence['level'] = -1);
    }
  }

  _setLevelAndPixScoreToCompetences(assessments, courses) {
    assessments.forEach((assessment) => {
      const courseId = assessment.get('courseId');

      const course = _.find(courses, function(course) {
        return course.id === courseId;
      });

      course.competences.forEach((competenceId) => {
        const linkedCompetence = _.find(this.competences, function(competence) {
          return competence.id === competenceId;
        });

        linkedCompetence.level = assessment.get('estimatedLevel');
        linkedCompetence.pixScore = assessment.get('pixScore');
      });
    });
  }

  _calculateTotalPixScore() {

    const competencesWithScore = _.filter(this.competences, (competence) => { return competence.hasOwnProperty('pixScore'); });

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
