const _ = require('lodash');
const Tube = require('../models/Tube.js');

function computeTubesFromSkills(skills) {
  const tubes = [];

  skills.forEach((skill) => {
    const tubeNameOfSkill = skill.tubeNameWithoutPrefix;
    const existingTube = tubes.find((tube) => tube.name === tubeNameOfSkill);
    if (existingTube) {
      existingTube.addSkill(skill);
    } else {
      tubes.push(new Tube({ skills: [skill], name: tubeNameOfSkill }));
    }
  });
  tubes.forEach((tube) => {
    tube.skills = _.sortBy(tube.skills, ['difficulty']);
  });

  return tubes;
}

module.exports = {
  computeTubesFromSkills,
};
