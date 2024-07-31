import { SimulationParameters } from '../../../../../src/evaluation/domain/models/SimulationParameters.js';
import { SmartRandomLog } from '../../../../../src/evaluation/domain/models/SmartRandomLog.js';
import { startLogging } from '../../../../../src/evaluation/domain/services/smart-random-log-service.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { Challenge } from '../../../../../src/shared/domain/models/Challenge.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Usecases | Get next challenge for simulator', function () {
  context('when there is still some challenges to pick', function () {
    it('should return the next challenge', async function () {
      // given
      const skill = domainBuilder.buildSkill({ difficulty: 2 });
      const challenge = domainBuilder.buildChallenge({ skill, locales: ['fr-fr'] });
      const simulationParameters = new SimulationParameters({
        skills: [skill],
        challenges: [challenge],
        answers: [],
        knowledgeElements: [],
        locale: 'fr-fr',
      });

      // when
      const { challenge: nextChallenge } = await evaluationUsecases.getNextChallengeForSimulator({
        simulationParameters,
      });

      // then
      expect(nextChallenge).to.be.instanceOf(Challenge);
      expect(nextChallenge.skill.id).to.equal(skill.id);
    });

    it('should return smart random details', async function () {
      // given
      const skill = domainBuilder.buildSkill({ difficulty: 2 });
      const challenge = domainBuilder.buildChallenge({ skill, locales: ['fr-fr'] });
      const simulationParameters = new SimulationParameters({
        skills: [skill],
        challenges: [challenge],
        answers: [],
        knowledgeElements: [],
        locale: 'fr-fr',
      });

      // when
      startLogging();
      const { smartRandomLog } = await evaluationUsecases.getNextChallengeForSimulator({
        simulationParameters,
      });

      // then
      expect(smartRandomLog).to.be.instanceOf(SmartRandomLog);
    });
  });

  context('when there is no more challenge', function () {
    it('should return only smartRandom details', async function () {
      // given
      const simulationParameters = new SimulationParameters({
        skills: [],
        challenges: [],
        answers: [],
        knowledgeElements: [],
        locale: 'fr-fr',
      });

      // when
      const { challenge, smartRandomLog } = await evaluationUsecases.getNextChallengeForSimulator({
        simulationParameters,
      });

      // then
      expect(challenge).to.be.null;
      expect(smartRandomLog).to.be.instanceOf(SmartRandomLog);
    });
  });
});
