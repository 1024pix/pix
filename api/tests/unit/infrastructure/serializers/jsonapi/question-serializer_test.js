const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/question-serializer');
const Question = require('../../../../../lib/domain/models/Question');
const Challenge = require('../../../../../lib/domain/models/Challenge');

describe('Unit | Serializer | JSONAPI | question-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Question model object into JSON API data', function() {
      // given
      const challenge = new Challenge(
        {
          id: 'challenge_id',
          instruction: 'Que peut-on dire des œufs de catégorie A ?',
          proposals: '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
          type: 'QCM',
          illustrationUrl: 'http://illustration.url',
          timer: 300,
          competenceId: 'competence_id',
          attachments: [
            'http://challenge.attachement.url.docx',
            'http://challenge.attachement.url.odt',
            'http://challenge.attachement.url.fuck',
          ],
          embedUrl: 'https://github.io/page/epreuve.html',
          embedTitle: 'Epreuve de selection de dossier',
          embedHeight: 500,
          format: 'mots',
        },
      );
      const question = new Question({ challenge, index: 4 });

      // when
      const json = serializer.serialize(question);

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
            timer: challenge.timer,
            competence: challenge.competenceId,
            attachments: [
              challenge.attachments[0],
              challenge.attachments[1],
              challenge.attachments[2],
            ],
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            format: 'mots',
            index: 4,
          },
        },
      });
    });

    describe('field "competence"', () => {

      it('should be the the first associated to the challenge when it exists', () => {
        // given
        const challenge = new Challenge({ id: 1, competenceId: 'competence_id' });
        const question = new Question({ challenge, index: 4 });

        // when
        const json = serializer.serialize(question);

        // then
        expect(json).to.deep.equal({
          data: {
            type: 'challenges',
            id: '1',
            attributes: {
              index: 4,
              competence: 'competence_id',
            },
          },
        });
      });

      it('should be null when no competence is associated to the challenge (ex: DEMO course)', () => {
        // given
        const challenge = new Challenge({ id: 1 });
        const question = new Question({ challenge, index: 4 });

        // when
        const json = serializer.serialize(question);

        // then
        expect(json).to.deep.equal({
          data: {
            type: 'challenges',
            id: '1',
            attributes: {
              index: 4,
              competence: 'N/A',
            },
          },
        });
      });
    });
  });
});
