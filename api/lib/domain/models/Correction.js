class Correction {

  constructor({ id, solution, hints = [] } = {}) {
    this.id = id;
    this.solution = solution;
    this.hints = hints;
  }
}

module.exports = Correction;
