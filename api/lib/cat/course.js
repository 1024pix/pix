class Course {
  constructor(challenges) {
    this.challenges = challenges;
  }

  get tubes() {
    const tubes = {};
    this.challenges.forEach(challenge => {
      challenge.skills.forEach(skill => {
        const tubeName = skill.tubeName;
        if(tubes[tubeName]) {
          tubes[tubeName].push(skill);
        } else {
          tubes[tubeName] = [skill];
        }
      });
    });
    Object.keys(tubes).forEach(tubeName => tubes[tubeName].sort((s1, s2) => s1.difficulty - s2.difficulty));
    return tubes;
  }
}

module.exports = Course;
