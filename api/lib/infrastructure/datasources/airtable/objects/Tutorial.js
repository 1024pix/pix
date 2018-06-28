class Tutorial {
  constructor(
    {
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

  static fromAirTableObject(airtableTutorialObject) {
    return new Tutorial({
      id: airtableTutorialObject['id'],
      duration: airtableTutorialObject['fields']['Durée'],
      format: airtableTutorialObject['fields']['Format'],
      link: airtableTutorialObject['fields']['Lien'],
      source: airtableTutorialObject['fields']['Source'],
      title: airtableTutorialObject['fields']['Titre'],
    });
  }
}

module.exports = Tutorial;
