'use strict';

const AirtableModel = require('./airtable-model');

class Course extends AirtableModel {

  initialize() {

    const fields = this.record.fields;
    this.name = fields['Nom'];
    this.description = fields['Description'];
    this.duration = fields['Durée'];
    this.challenges = fields['Épreuves'];
    this.isAdaptive = fields['Adaptatif ?'];

    if (fields['Image'] && fields['Image'].length > 0) {
      this.imageUrl = fields['Image'][0].url;
    }
  }

}

module.exports = Course;
