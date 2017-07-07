const _ = require('lodash');

class Profile {
  constructor(user, competences, areas, assessments, courses) {
    this.user = user;
    this.competences = competences;
    this.areas = areas;
    this.initCompetenceLevel();
    this.setLevelToCompetences(assessments, courses);
  }

  initCompetenceLevel() {
    if (this.competences) {
      this.competences.forEach((competence) => competence['level'] = -1);
    }
  }

  setLevelToCompetences(assessments, courses) {
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
}

module.exports = Profile;
