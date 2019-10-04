class Tutorial {
  constructor({
    id,
    duration,
    format,
    link,
    source,
    title
  } = {}) {
    this.id = id;
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
  }

  static getAirtableName() {
    return 'Tutoriels';
  }

  static getUsedAirtableFields() {
    return [
      'Durée',
      'Format',
      'Lien',
      'Source',
      'Titre',
    ];
  }

  static fromAirTableObject(airtableTutorialObject) {
    return new Tutorial({
      id: airtableTutorialObject.getId(),
      duration: airtableTutorialObject.get('Durée'),
      format: airtableTutorialObject.get('Format'),
      link: airtableTutorialObject.get('Lien'),
      source: airtableTutorialObject.get('Source'),
      title: airtableTutorialObject.get('Titre'),
    });
  }
}

module.exports = Tutorial;
