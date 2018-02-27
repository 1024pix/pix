class Assessment {
  constructor(attributes) {
    Object.assign(this, attributes);
  }

  isCompleted() {
    return this.status === 'completed';
  }
}

module.exports = Assessment;
