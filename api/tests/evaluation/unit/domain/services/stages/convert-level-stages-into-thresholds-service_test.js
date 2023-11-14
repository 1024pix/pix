import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { convertLevelStagesIntoThresholds } from '../../../../../../src/evaluation/domain/services/stages/convert-level-stages-into-thresholds-service.js';

describe('Unit | Service | Convert Level Stages Into Thresholds', function () {
  describe('convertLevelStagesIntoThresholds', function () {
    let stages;

    before(function () {
      stages = [
        domainBuilder.buildStage({ level: 0, threshold: null }),
        domainBuilder.buildStage({ level: null, threshold: null, isFirstSkill: true }),
        domainBuilder.buildStage({ level: 1, threshold: null }),
        domainBuilder.buildStage({ level: 2, threshold: null }),
        domainBuilder.buildStage({ level: 3, threshold: null }),
      ];

      const skills = [
        domainBuilder.buildSkill({ id: '1', difficulty: 1 }),
        domainBuilder.buildSkill({ id: '2', difficulty: 1 }),
        domainBuilder.buildSkill({ id: '3', difficulty: 1 }),
        domainBuilder.buildSkill({ id: '4', difficulty: 2 }),
        domainBuilder.buildSkill({ id: '4', difficulty: 3 }),
      ];

      convertLevelStagesIntoThresholds(stages, skills);
    });

    it('should not convert zero stage', function () {
      expect(stages[0].level).to.deep.equal(0);
      expect(stages[0].threshold).to.be.null;
    });

    it('should not convert first skill stage', function () {
      expect(stages[1].level).to.be.null;
      expect(stages[1].threshold).to.be.null;
    });

    it('should convert level stages', function () {
      expect(stages[2].level).to.be.undefined;
      expect(stages[2].threshold).to.deep.equal(60);
      expect(stages[3].level).to.be.undefined;
      expect(stages[3].threshold).to.deep.equal(80);
      expect(stages[4].level).to.be.undefined;
      expect(stages[4].threshold).to.deep.equal(100);
    });
  });
});
