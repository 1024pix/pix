import { expect } from 'chai';

import { SmartRandomSkillReward } from '../../../../../src/evaluation/domain/models/SmartRandomSkillReward.js';
import { SmartRandomStep, STEPS_NAMES } from '../../../../../src/evaluation/domain/models/SmartRandomStep.js';
import {
  clearLog,
  getSmartRandomLog,
  logPredictedLevel,
  logSkillReward,
  logStep,
  startLogging,
} from '../../../../../src/evaluation/domain/services/smart-random-log-service.js';
import { buildSkill } from '../../../../tooling/domain-builder/factory/index.js';

const skill = buildSkill();

describe('Integration | Service | Smart Random Log', function () {
  describe('when the logger has been initialized', function () {
    beforeEach(function () {
      startLogging();
    });

    it('should log a step', function () {
      // given
      logStep(STEPS_NAMES.DEFAULT_LEVEL, [skill]);

      // when
      const log = getSmartRandomLog();

      // then
      expect(log.steps[0]).to.to.be.an.instanceOf(SmartRandomStep);
      expect(log.steps).to.deep.equal([
        {
          name: STEPS_NAMES.DEFAULT_LEVEL,
          outputSkills: [skill],
        },
      ]);
    });

    it('should log the predicted level', function () {
      // when
      logPredictedLevel(2.5);

      // then
      const log = getSmartRandomLog();
      expect(log.predictedLevel).to.equal(2.5);
    });

    it('should log a skill reward', function () {
      // when
      logSkillReward('skillId', 2.5);
      const log = getSmartRandomLog();

      // then
      expect(log.skillRewards[0]).to.be.an.instanceOf(SmartRandomSkillReward);
      expect(log.skillRewards).to.deep.equal([{ skillId: 'skillId', reward: 2.5 }]);
    });

    it('should stop logging after clearLog execution', function () {
      // when
      clearLog();
      logStep(STEPS_NAMES.DEFAULT_LEVEL, [skill]);
      logSkillReward('skillId', 2.5);
      logPredictedLevel(2.5);
      const log = getSmartRandomLog();

      // then
      expect(log).to.be.null;
    });
  });

  describe('when the logger has not been initialized', function () {
    it('should not log anything', function () {
      // when
      logStep(STEPS_NAMES.DEFAULT_LEVEL, [skill]);
      logSkillReward('skillId', 2.5);
      logPredictedLevel(2.5);
      const log = getSmartRandomLog();

      // then
      expect(log).to.be.null;
    });
  });
});
