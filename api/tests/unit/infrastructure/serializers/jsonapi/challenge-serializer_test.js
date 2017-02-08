const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');
const Challenge = require('../../../../../lib/domain/models/referential/challenge');

describe('Unit | Serializer | JSONAPI | challenge-serializer', function () {

  describe('#serialize()', function () {

    it('should convert a Challenge model object into JSON API data', function () {

      const challenge = new Challenge();
      challenge.id = 'challenge_id';
      challenge.instruction = 'Que peut-on dire des œufs de catégorie A ?';
      challenge.proposals = '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n';
      challenge.type = 'QCM';
      challenge.illustrationUrl = 'http://challenge.illustration.url';
      challenge.hasntInternetAllowed = false;
      challenge.timer = 300;
      challenge.attachments = [
        'http://challenge.attachement.url.docx',
        'http://challenge.attachement.url.odt',
        'http://challenge.attachement.url.fuck'
      ];

      // when
      const json = serializer.serialize(challenge);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'challenges',
          id: challenge.id,
          attributes: {
            instruction: challenge.instruction,
            proposals: challenge.proposals,
            type: challenge.type,
            'illustration-url': challenge.illustrationUrl,
            'hasnt-internet-allowed': challenge.hasntInternetAllowed,
            timer: challenge.timer,
            attachments: [
              challenge.attachments[0],
              challenge.attachments[1],
              challenge.attachments[2]
            ]
          }
        }
      });
    });

  });

});
