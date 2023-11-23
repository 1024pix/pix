import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { getNewAcquiredStages } from '../../../../../../src/evaluation/domain/services/stages/get-new-acquired-stages-service.js';

describe('Unit | Service | Stages calculation', function () {
  describe('getNewAcquiredStages', function () {
    let dataSet;
    before(function () {
      dataSet = [
        {
          given: {
            stages: [
              { id: 50, threshold: 30 },
              { id: 4, threshold: 40 },
              { id: 1, threshold: 0 },
              { id: 8, threshold: null, isFirstSkill: true },
              { id: 6, threshold: 60 },
              { id: 5, threshold: 50 },
              { id: 2, threshold: 20 },
            ].map(domainBuilder.buildStage),
            validatedSkillCount: 2,
            alreadyAcquiredStagesIds: [50],
            masteryPercentage: 34,
          },
          expected: { stageIds: [1, 8, 2] },
        },
        {
          given: {
            stages: [
              { id: 4, threshold: 40 },
              { id: 1, threshold: 0 },
              { id: 6, threshold: 60 },
              { id: 5, threshold: 50 },
              { id: 2, threshold: 20 },
            ].map(domainBuilder.buildStage),
            validatedSkillCount: 0,
            alreadyAcquiredStagesIds: [],
            masteryPercentage: 2,
          },
          expected: { stageIds: [1] },
        },
        {
          given: {
            stages: [{ id: 8, threshold: null, isFirstSkill: true }].map(domainBuilder.buildStage),
            validatedSkillCount: 0,
            alreadyAcquiredStagesIds: [],
            masteryPercentage: 0,
          },
          expected: { stageIds: [] },
        },
        {
          given: {
            stages: [
              { id: 8, threshold: 0 },
              { id: 4, threshold: 2 },
            ].map(domainBuilder.buildStage),
            validatedSkillCount: 0,
            alreadyAcquiredStagesIds: [],
            masteryPercentage: 2,
          },
          expected: { stageIds: [8, 4] },
        },
      ];
    });
    it('should return the correct number of stages', function () {
      dataSet.forEach(
        ({
          given: { stages, validatedSkillCount, alreadyAcquiredStagesIds, masteryPercentage },
          expected: { stageIds },
        }) => {
          const acquiredStages = getNewAcquiredStages(
            stages,
            validatedSkillCount,
            masteryPercentage,
            alreadyAcquiredStagesIds,
          );

          expect(acquiredStages.map(({ id }) => id)).to.deep.equal(stageIds);
        },
      );
    });
  });
});
