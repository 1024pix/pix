import { expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/shared/infrastructure/serializers/jsonapi/challenge-serializer.js';
import { Challenge } from '../../../../../../src/shared/domain/models/Challenge.js';
import { ChallengeInstruction } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | JSONAPI | challenge-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Challenge model object into JSON API data', function () {
      // given
      const challenge = new Challenge({
        id: 'challenge_id',
        instruction: 'Que peut-on dire des œufs de catégorie A ?',
        proposals:
          '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
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
        shuffled: false,
      });

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
            timer: challenge.timer,
            competence: challenge.competenceId,
            attachments: [challenge.attachments[0], challenge.attachments[1], challenge.attachments[2]],
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            format: 'mots',
            shuffled: false,
          },
        },
      });
    });

    describe('field "competence"', function () {
      it('should be the the first associated to the challenge when it exists', function () {
        // given
        const challenge = new Challenge({ competenceId: 'competence_id' });

        // when
        const json = serializer.serialize(challenge);

        // then
        expect(json.data.attributes.competence).to.equal('competence_id');
      });

      it('should be null when no competence is associated to the challenge (ex: DEMO course)', function () {
        // given
        const challenge = new Challenge();

        // when
        const json = serializer.serialize(challenge);

        // then
        expect(json.data.attributes.competence).to.equal('N/A');
      });
    });

    describe('#instruction', function () {
      it('should transform ChallengeInstruction to string', function () {
        // given
        const challenge = new Challenge({
          // id: '1',
          instruction: new ChallengeInstruction({ source: 'La consigne' }),
        });

        // when
        const json = serializer.serialize(challenge);

        // then
        expect(json.data.attributes.instruction).to.equal('La consigne');
      });
    });
  });
});
