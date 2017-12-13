const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');
const Challenge = require('../../../../../lib/domain/models/Challenge');

describe('Unit | Serializer | JSONAPI | challenge-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Challenge model object into JSON API data', function() {
      // given
      const challenge = new Challenge();
      challenge.id = 'challenge_id';
      challenge.instruction = 'Que peut-on dire des œufs de catégorie A ?';
      challenge.proposals = '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n';
      challenge.type = 'QCM';
      challenge.illustrationUrl = 'http://challenge.illustration.url';
      challenge.hasntInternetAllowed = false;
      challenge.timer = 300;
      challenge.competence = ['competence_id'];
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
            competence: challenge.competence[0],
            attachments: [
              challenge.attachments[0],
              challenge.attachments[1],
              challenge.attachments[2]
            ]
          }
        }
      });
    });

    describe('field "competence"', () => {

      it('should be the the first associated to the challenge when it exists', () => {
        // given
        const challenge = new Challenge();
        challenge.id = 1;
        challenge.competence = ['competence_id'];

        // when
        const json = serializer.serialize(challenge);

        // then
        expect(json).to.deep.equal({
          data: {
            type: 'challenges',
            id: '1',
            attributes: {
              competence: 'competence_id',
            }
          }
        });
      });

      it('should be null when no competence is associated to the challenge (ex: DEMO course)', () => {
        // given
        const challenge = new Challenge();
        challenge.id = 1;

        // when
        const json = serializer.serialize(challenge);

        // then
        expect(json).to.deep.equal({
          data: {
            type: 'challenges',
            id: '1',
            attributes: {
              competence: 'N/A',
            }
          }
        });
      });

    });

  });

});
