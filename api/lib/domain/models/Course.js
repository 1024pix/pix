const _ = require('lodash');
const Tube = require('./Tube');

class Course {

  constructor({
    id,
    // attributes
    description,
    imageUrl,
    isAdaptive,
    name,
    type,
    // includes
    assessment,
    competenceSkills = [],
    tubes = [],
    // references
    challenges = [],
    competences = [],
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.isAdaptive = isAdaptive;
    this.type = type;
    // includes
    this.assessment = assessment;
    this.competenceSkills = competenceSkills;
    this.tubes = tubes;
    // references
    this.challenges = challenges; // Array of Record IDs
    this.competences = competences; // Array of Record IDs
  }

  get nbChallenges() {
    return this.challenges.length;
  }

  findTube(tubeName) {
    return this.tubes.find((tube) => tube.name === tubeName);
  }

  static findByCompetenceId(courses, competenceId) {
    return courses.find((course) => course.competences[0] === competenceId);
  }

  computeTubes(listSkills) {
    const tubes = [];

    listSkills.forEach((skill) => {
      const tubeNameOfSkill = skill.tubeName;

      if (!tubes.find((tube) => tube.name === tubeNameOfSkill)) {
        tubes.push(new Tube({ skills: [skill] }));
      } else {
        const tube = this.findTube(tubeNameOfSkill);
        tube.addSkill(skill);
      }
      this.tubes = tubes;

    });

    tubes.forEach((tube) =>  {
      tube.skills = _.sortBy(tube.skills, ['difficulty']);
    });
    this.tubes = tubes;
    return tubes;
  }
}

module.exports = Course;
