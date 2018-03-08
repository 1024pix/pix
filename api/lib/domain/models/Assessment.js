class Assessment {
  constructor(attributes) {
    // TODO: estimatedLevel et pixScore pourrait être renommé en totalLevel et totalScore ?
    this.marks = [];
    Object.assign(this, attributes);
  }

  isCompleted() {
    return Boolean(this.estimatedLevel && this.pixScore
      || (this.estimatedLevel === 0)|| (this.pixScore === 0));
  }
}

module.exports = Assessment;
