import { getMasteryPercentage } from '../../../../../src/evaluation/domain/services/get-mastery-percentage-service.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Service | Compute mastery percentage', function () {
  let dataSets;

  before(function () {
    dataSets = [
      {
        knowledgeState: domainBuilder.buildKnowledgeState.forSkills({ validatedSkillIds: [1, 2, 3] }),
        skillIds: [1, 2, 3],
        expected: 100,
        expectedWithoutRound: 100,
      },
      {
        knowledgeState: domainBuilder.buildKnowledgeState.forSkills({ validatedSkillIds: [1, 2] }),
        skillIds: [1, 2, 3],
        expected: 67,
        expectedWithoutRound: (2 * 100) / 3,
      },
      {
        knowledgeState: domainBuilder.buildKnowledgeState.forSkills({
          invalidatedSkillIds: [1],
          validatedSkillIds: [2],
        }),
        skillIds: [1, 2, 3, 4],
        expected: 25,
        expectedWithoutRound: 25,
      },
      {
        knowledgeState: domainBuilder.buildKnowledgeState.forSkills({
          invalidatedSkillIds: [1],
          validatedSkillIds: [2],
        }),
        skillIds: [],
        expected: 0,
        expectedWithoutRound: 0,
      },
      {
        knowledgeState: domainBuilder.buildKnowledgeState.forSkills({ validatedSkillIds: [1] }),
        skillIds: [4],
        expected: 0,
        expectedWithoutRound: 0,
      },
    ];
  });

  describe('getMasteryPercentage', function () {
    it('should return the correct mastery percentage', function () {
      dataSets.forEach((dataSet) => {
        expect(getMasteryPercentage(dataSet.knowledgeState, dataSet.skillIds)).to.deep.equal(dataSet.expected);
        expect(getMasteryPercentage(dataSet.knowledgeState, dataSet.skillIds, false)).to.deep.equal(
          dataSet.expectedWithoutRound,
        );
      });
    });
  });
});
