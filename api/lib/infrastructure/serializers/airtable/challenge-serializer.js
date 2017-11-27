const _ = require('../../utils/lodash-utils');
const Challenge = require('../../../domain/models/Challenge');
const Skill = require('../../../domain/models/Skill');
const AirtableSerializer = require('./airtable-serializer');

class ChallengeSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {

    const challenge = new Challenge();

    challenge.id = airtableRecord.id;

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;
      challenge.instruction = fields['Consigne'];
      challenge.proposals = fields['Propositions'];

      _(fields['acquis']).forEach((acquis) => {
        challenge.addSkill(new Skill(acquis));
      });

      challenge.status = fields['Statut'];
      challenge.competence = (fields['competences']) ? fields['competences'][0] : undefined;

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
