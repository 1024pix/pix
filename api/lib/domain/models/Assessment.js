class Assessment {
  constructor(attributes) {
    Object.assign(this, attributes);
  }

  isCompleted() {
    return Boolean(this.estimatedLevel && this.pixScore
      || (this.estimatedLevel === 0)|| (this.pixScore === 0));
  }
}

module.exports = Assessment;
