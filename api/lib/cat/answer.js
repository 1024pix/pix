class Answer {
  constructor(challenge, result) {
    this.challenge = challenge;
    this.result = result;
  }

  get binaryOutcome() {
    return this.result === 'ok' ? 1 : 0;
  }

  get maxDifficulty() {
    const difficulties = this.challenge.skills.map(skill => skill.difficulty);
    if (difficulties.length > 0) {
      return Math.max(...difficulties);
    } else {
      return 2;
    }
  }
}

module.exports = Answer;
