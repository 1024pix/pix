class Challenge {
  constructor({
    id,
    instruction,
    proposals,
    type,
    solution,
    t1Status,
    t2Status,
    t3Status,
    scoring,
    status,
    skillIds = []
  }) {
    this.id = id;
    this.instruction = instruction;
    this.proposals = proposals;
    this.type = type;
    this.solution = solution;
    this.t1Status = t1Status;
    this.t2Status = t2Status;
    this.t3Status = t3Status;
    this.scoring = scoring;
    this.status = status;
    this.skillIds = skillIds;
  }

  static fromAirTableObject(airtableEpreuveObject) {
    return new Challenge({
      id: airtableEpreuveObject['id'],
      instruction: airtableEpreuveObject['fields']['Consigne'],
      proposals: airtableEpreuveObject['fields']['Propositions'],
      type: airtableEpreuveObject['fields']['Type d\'épreuve'],
      solution: airtableEpreuveObject['fields']['Bonnes réponses'],
      t1Status: airtableEpreuveObject['fields']['T1 - Espaces, casse & accents'],
      t2Status: airtableEpreuveObject['fields']['T2 - Ponctuation'],
      t3Status: airtableEpreuveObject['fields']['T3 - Distance d\'édition'],
      scoring: airtableEpreuveObject['fields']['Scoring'],
      status: airtableEpreuveObject['fields']['Statut'],
      skillIds: airtableEpreuveObject['fields']['Acquix']
    });
  }
}

module.exports = Challenge;
