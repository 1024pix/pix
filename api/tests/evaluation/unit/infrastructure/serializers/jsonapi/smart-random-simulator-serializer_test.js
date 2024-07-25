import { Answer } from '../../../../../../src/evaluation/domain/models/Answer.js';
import { SimulationParameters } from '../../../../../../src/evaluation/domain/models/SimulationParameters.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/smart-random-simulator-serializer.js';
import { Challenge, KnowledgeElement, Skill } from '../../../../../../src/shared/domain/models/index.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | smart-random-simulator-serializer', function () {
  describe('#deserialize()', function () {
    let jsonAnswer;

    beforeEach(function () {
      jsonAnswer = {
        data: {
          attributes: {
            'knowledge-elements': [
              {
                source: 'direct',
                status: 'validated',
                'answer-id': 12345678,
                'skill-id': 'rec45678765',
              },
            ],
            answers: [
              {
                result: 'ok',
                'challenge-id': 'rec1234567',
              },
            ],
            skills: [
              {
                id: 'recoaijndozia123',
                difficulty: 3,
                name: '@skillname3',
              },
            ],
            challenges: [
              {
                id: 'challengerec1234567',
                skill: {
                  id: 'recoaijndozia123',
                  name: '@skillname3',
                },
                locales: ['fr-fr'],
              },
            ],
            locale: 'fr-fr',
            'assessment-id': 12346,
          },
        },
      };
    });

    it('should convert JSON API data into an object', async function () {
      // when
      const simulatorParameters = await serializer.deserialize(jsonAnswer);

      // then
      expect(simulatorParameters).to.be.instanceOf(SimulationParameters);
      expect(simulatorParameters.answers[0]).to.be.instanceOf(Answer);
      expect(simulatorParameters.skills[0]).to.be.instanceOf(Skill);
      expect(simulatorParameters.knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
      expect(simulatorParameters.challenges[0]).to.be.instanceOf(Challenge);
    });
  });
});
