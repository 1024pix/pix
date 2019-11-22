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
    skillIds = [],
    skills = [],
    timer,
    illustrationUrl,
    attachments,
    competenceId,
    embedUrl,
    embedTitle,
    embedHeight,
    illustrationAlt,
  } = {}) {
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
    this.skills = skills;
    this.timer = timer;
    this.illustrationUrl = illustrationUrl;
    this.attachments = attachments;
    this.competenceId = competenceId;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
    this.illustrationAlt = illustrationAlt;
  }

  static getAirtableName() {
    return 'Epreuves';
  }

  static getUsedAirtableFields() {
    return [
      'Illustration de la consigne',
      'Pièce jointe',
      'Compétences (via tube)',
      'Timer',
      'Consigne',
      'Propositions',
      'Type d\'épreuve',
      'Bonnes réponses',
      'T1 - Espaces, casse & accents',
      'T2 - Ponctuation',
      'T3 - Distance d\'édition',
      'Scoring',
      'Statut',
      'Acquix',
      'acquis',
      'Embed URL',
      'Embed title',
      'Embed height',
      'Texte alternatif illustration',
    ];
  }

  static fromAirTableObject(airtableEpreuveObject) {

    let illustrationUrl;
    if (airtableEpreuveObject.get('Illustration de la consigne')) {
      illustrationUrl = airtableEpreuveObject.get('Illustration de la consigne')[0].url;
    }

    let attachments;
    if (airtableEpreuveObject.get('Pièce jointe')) {
      attachments = airtableEpreuveObject.get('Pièce jointe').map((attachment) => attachment.url).reverse();
    }

    let competenceId;
    if (airtableEpreuveObject.get('Compétences (via tube)')) {
      competenceId = airtableEpreuveObject.get('Compétences (via tube)')[0];
    }

    let timer;
    if (airtableEpreuveObject.get('Timer')) {
      timer = parseInt(airtableEpreuveObject.get('Timer'));
    }

    return new Challenge({
      id: airtableEpreuveObject.getId(),
      instruction: airtableEpreuveObject.get('Consigne'),
      proposals: airtableEpreuveObject.get('Propositions'),
      type: airtableEpreuveObject.get('Type d\'épreuve'),
      solution: airtableEpreuveObject.get('Bonnes réponses'),
      t1Status: airtableEpreuveObject.get('T1 - Espaces, casse & accents'),
      t2Status: airtableEpreuveObject.get('T2 - Ponctuation'),
      t3Status: airtableEpreuveObject.get('T3 - Distance d\'édition'),
      scoring: airtableEpreuveObject.get('Scoring'),
      status: airtableEpreuveObject.get('Statut'),
      skillIds: airtableEpreuveObject.get('Acquix'),
      skills: airtableEpreuveObject.get('acquis'),
      embedUrl: airtableEpreuveObject.get('Embed URL'),
      embedTitle: airtableEpreuveObject.get('Embed title'),
      embedHeight: airtableEpreuveObject.get('Embed height'),
      timer,
      illustrationUrl,
      attachments,
      competenceId,
      illustrationAlt: airtableEpreuveObject.get('Texte alternatif illustration'),
    });
  }
}

module.exports = Challenge;
