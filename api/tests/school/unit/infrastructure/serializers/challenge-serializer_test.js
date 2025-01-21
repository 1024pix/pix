import * as serializer from '../../../../../src/school/infrastructure/serializers/challenge-serializer.js';
import { Challenge } from '../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Serializer | challenge-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Challenge model object into JSON API data', function () {
      // given
      const challenge = new Challenge({
        id: 'challenge_id',
        instruction: 'Une première bulle.<br/>Pour tout mettre***Une deuxième bulle\n sur plusieurs lignes',
        proposals:
          '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
        type: 'QCM',
        illustrationUrl: 'http://illustration.url',
        timer: 300,
        competenceId: 'competence_id',
        embedUrl: 'url',
        embedTitle: 'title',
        embedHeight: 12,
        webComponentTagName: 'tagName',
        webComponentProps: {
          prop1: 'value 1',
          prop2: 'value 2',
        },
        format: 'mots',
        shuffled: false,
        locales: ['fr', 'en'],
        focused: false,
        illustrationAlt: 'alt',
        autoReply: false,
      });

      // when
      const json = serializer.serialize(challenge);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'challenges',
          id: challenge.id,
          attributes: {
            instructions: ['Une première bulle.<br/>Pour tout mettre', 'Une deuxième bulle\n sur plusieurs lignes'],
            proposals: challenge.proposals,
            type: challenge.type,
            'illustration-url': challenge.illustrationUrl,
            format: 'mots',
            shuffled: false,
            focused: false,
            'embed-url': 'url',
            'embed-title': 'title',
            'embed-height': 12,
            'web-component-tag-name': 'tagName',
            'web-component-props': {
              prop1: 'value 1',
              prop2: 'value 2',
            },
            timer: 300,
            'illustration-alt': 'alt',
            'auto-reply': false,
          },
        },
      });
    });
  });
});
