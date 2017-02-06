const _ = include('lib/utils/lodash-utils');
const Challenge = require('../../../domain/models/referential/challenge');

class ChallengeSerializer {

  deserialize(airtableRecord) {

    const challenge = new Challenge();

    challenge.id = airtableRecord.id;

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;
      challenge.instruction = fields['Consigne'];
      challenge.proposals = fields['Propositions'];

      if (fields['Timer']) {
        challenge.timer = _.defaultTo(_.parseInt(fields['Timer']), undefined);
      }
      challenge.type = fields['Type d\'épreuve'];
      if (fields['Internet et outils']) {
        challenge.hasntInternetAllowed = fields['Internet et outils'].toUpperCase() === 'NON';
      }

      if (fields['Illustration de la consigne']) {
        challenge.illustrationUrl = fields['Illustration de la consigne'][0].url;
      }

      if (fields['Pièce jointe']) {
        challenge.attachments = fields['Pièce jointe'].map(attachment => attachment.url).reverse();
      }
    }

    return challenge;
  }

}

module.exports = new ChallengeSerializer();
