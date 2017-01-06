const AirtableModel = require('./airtable-model');

class Challenge extends AirtableModel {

  initialize() {

    super.initialize();

    if (this.record.fields) {

      const fields = this.record.fields;
      this.instruction = fields['Consigne'];
      this.proposals = fields['Propositions'];
      this.type = fields['Type d\'épreuve'];
      if (fields['Internet et outils']) {
        this.hasntInternetAllowed = fields['Internet et outils'].toUpperCase() === 'NON';
      }

      if (fields['Illustration de la consigne']) {
        this.illustrationUrl = fields['Illustration de la consigne'][0].url;
      }

      if (fields['Pièce jointe']) {
        const { url, filename } = fields['Pièce jointe'][0];
        this.attachmentUrl = url;
        this.attachmentFilename = filename;
      }
    }
  }

}

module.exports = Challenge;
