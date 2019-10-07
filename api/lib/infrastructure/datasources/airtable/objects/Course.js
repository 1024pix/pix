class Course {
  constructor({
    id,
    name,
    description,
    adaptive,
    imageUrl,
    competences,
    challenges,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.adaptive = adaptive;
    this.imageUrl = imageUrl;
    this.competences = competences;
    this.challenges = challenges;
  }

  static fromAirTableObject(airtableRecord) {
    let imageUrl;
    if (airtableRecord.get('Image')) {
      imageUrl = airtableRecord.get('Image')[0].url;
    }

    return new Course({
      id: airtableRecord.getId(),
      name: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      adaptive: airtableRecord.get('Adaptatif ?'),
      competences: airtableRecord.get('Competence'),
      challenges: airtableRecord.get('Épreuves'),
      imageUrl,
    });
  }
}

module.exports = Course;
