const _ = require('lodash');

class Assessment {
  constructor(attributes) {
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

  setCompleted() {
    this.state = 'completed';
  }
}

module.exports = Assessment;
