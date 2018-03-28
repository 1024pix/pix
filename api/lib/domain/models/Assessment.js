const _ = require('lodash');
const TYPES_OF_ASSESSMENT_NEEDING_USER = ['PLACEMENT', 'CERTIFICATION'];

class Assessment {
  constructor(attributes) {
    this.marks = [];
    Object.assign(this, attributes);
  }

  isCompleted() {
    return this.state === 'completed';
  }

  getLastAssessmentResult() {
    if(this.assessmentResults) {
      return _(this.assessmentResults).sortBy(['createdAt']).last();
    }
    return null;
  }

  getPixScore() {
    if(this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().pixScore;
    }
    return null;
  }

  getLevel() {
    if(this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().level;
    }
    return null;
  }

  setCompleted() {
    this.state = 'completed';
  }

  validate() {
    if(TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && typeof this.userId !== 'number') {
      return Promise.reject();
    }
    return Promise.resolve();
  }
}

module.exports = Assessment;
