class QrocmSolutions {
  constructor(proposals) {
    this.value = {};
    this.tolerances = {};

    proposals.forEach((proposal) => {
      if (['select', 'input'].includes(proposal.type)) {
        this.value[proposal.input] = proposal.solutions;
        this.tolerances[proposal.input] = proposal.tolerances;
      }
    });
  }
}

export { QrocmSolutions };
