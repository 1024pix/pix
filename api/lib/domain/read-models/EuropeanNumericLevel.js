class EuropeanNumericLevel {
  constructor({ domainCompetenceId, competenceId, level }) {
    this.domainCompetenceId = domainCompetenceId;
    this.competenceId = competenceId;
    this.level = level;
  }

  static from({ competenceCode, level }) {
    const [domainCompetenceId, competenceId] = competenceCode.split('.');
    return new EuropeanNumericLevel({ domainCompetenceId, competenceId, level });
  }
}

export default EuropeanNumericLevel;
