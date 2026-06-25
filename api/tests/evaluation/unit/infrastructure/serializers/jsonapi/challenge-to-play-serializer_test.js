import { expect } from 'chai';

import { challengeToPlaySerializer } from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/challenge-to-play-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Infrastructure | Serializer | JSONAPI | challenge-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a ChallengeToPlay model object into JSON API data', function () {
      const challenge = domainBuilder.evaluation.buildChallengeToPlay({
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
        webComponentTagName: 'web-component',
        webComponentProps: {
          prop1: 'value 1',
          prop2: 'value 2',
        },
        format: 'mots',
        shuffled: false,
        locales: ['fr', 'en'],
        illustrationAlt: null,
        autoReply: null,
        alternativeInstruction: null,
        focused: null,
      });

      const json = challengeToPlaySerializer.serialize(challenge);

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
            'web-component-tag-name': 'web-component',
            'web-component-props': {
              prop1: 'value 1',
              prop2: 'value 2',
            },
            format: 'mots',
            shuffled: false,
            locales: ['fr', 'en'],
          },
        },
      });
    });

    it('should convert a ChallengeToPlay with no competence when challenge is not linked to a competence', function () {
      const challenge = domainBuilder.evaluation.buildChallengeToPlay({
        id: 'challenge_id',
        instruction: 'Que peut-on dire des œufs de catégorie A ?',
        proposals:
          '- Ils sont bio.\n- Ils pèsent plus de 63 grammes.\n- Ce sont des oeufs frais.\n- Ils sont destinés aux consommateurs.\n- Ils ne sont pas lavés.\n',
        type: 'QCM',
        illustrationUrl: 'http://illustration.url',
        timer: 300,
        competenceId: null,
        attachments: [
          'http://challenge.attachement.url.docx',
          'http://challenge.attachement.url.odt',
          'http://challenge.attachement.url.fuck',
        ],
        embedUrl: 'https://github.io/page/epreuve.html',
        embedTitle: 'Epreuve de selection de dossier',
        embedHeight: 500,
        webComponentTagName: 'web-component',
        webComponentProps: {
          prop1: 'value 1',
          prop2: 'value 2',
        },
        format: 'mots',
        shuffled: false,
        locales: ['fr', 'en'],
        illustrationAlt: null,
        autoReply: null,
        alternativeInstruction: null,
        focused: null,
      });

      const json = challengeToPlaySerializer.serialize(challenge);

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
            competence: 'N/A',
            attachments: [challenge.attachments[0], challenge.attachments[1], challenge.attachments[2]],
            'embed-url': 'https://github.io/page/epreuve.html',
            'embed-title': 'Epreuve de selection de dossier',
            'embed-height': 500,
            'web-component-tag-name': 'web-component',
            'web-component-props': {
              prop1: 'value 1',
              prop2: 'value 2',
            },
            format: 'mots',
            shuffled: false,
            locales: ['fr', 'en'],
          },
        },
      });
    });
  });
});
