'use strict';

const AirtableModel = require('./airtable-model');
const _ = require('lodash');

class Course extends AirtableModel {

  initialize() {

    super.initialize();

    if (this.record.fields) {


      const fields = this.record.fields;

      // See https://github.com/Airtable/airtable.js/issues/17
      const debuggedFieldsEpreuves = fields['Épreuves'];
      if (_.isArray(debuggedFieldsEpreuves)) {
        _.reverse(debuggedFieldsEpreuves);
      }
      this.name = fields['Nom'];
      this.description = fields['Description'];
      this.duration = fields['Durée'];
      this.challenges = debuggedFieldsEpreuves;
      this.isAdaptive = fields['Adaptatif ?'];

      if (fields['Image'] && fields['Image'].length > 0) {
        this.imageUrl = fields['Image'][0].url;
      }
    }
  }

}

module.exports = Course;
