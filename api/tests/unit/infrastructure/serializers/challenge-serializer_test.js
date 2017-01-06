/* global describe, it, expect */
const serializer = require('../../../../lib/infrastructure/serializers/challenge-serializer');
const Challenge = require('../../../../lib/domain/models/referential/challenge');

describe('Unit | Serializer | ChallengeSerializer', function () {

  describe('#serialize()', function () {

    it('should convert a Challenge model object into JSON API data', function () {
      const record = {
        'id': 'challenge_id',
        'fields': {
          'Consigne': 'Que peut-on dire des œufs de catégorie A ?\n',
          'Propositions': '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
          'Type d\'épreuve': 'QCM',
          'Illustration de la consigne': [{
            'url': 'http://challenge.illustration.url'
          }],
          'Pièce jointe': [{
            'url': 'http://challenge.attachement.url',
            'filename': 'challenge_attachment_name'
          }]
        }
      };
      const challenge = new Challenge(record);

      // when
      const json = serializer.serialize(challenge);

      // then
      expect(json).to.deep.equal({
        'data': {
          'type': 'challenges',
          'id': challenge.id,
          'attributes': {
            'instruction': challenge.instruction,
            'proposals': challenge.proposals,
            'type': challenge.type,
            'illustration-url': challenge.illustrationUrl,
            'attachment-url': challenge.attachmentUrl,
            'hasnt-internet-allowed': challenge.hasntInternetAllowed,
            'attachment-filename': challenge.attachmentFilename
          }
        }
      });
    });

  });

});
