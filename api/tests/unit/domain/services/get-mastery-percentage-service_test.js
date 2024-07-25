import { getMasteryPercentage } from '../../../../lib/domain/services/get-mastery-percentage-service.js';
import { KnowledgeElement } from '../../../../src/shared/domain/models/index.js';
import { expect } from '../../../test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Service | Compute mastery percentage', function () {
  let dataSets;

  before(function () {
    dataSets = [
      {
        knowledgeElements: [
          { id: 1, skillId: 1, status: KnowledgeElement.StatusType.VALIDATED },
          { id: 2, skillId: 2, status: KnowledgeElement.StatusType.VALIDATED },
          { id: 3, skillId: 3, status: KnowledgeElement.StatusType.VALIDATED },
        ].map(domainBuilder.buildKnowledgeElement),
        skillIds: [1, 2, 3],
        expected: 100,
      },
      {
        knowledgeElements: [
          { id: 1, skillId: 1, status: KnowledgeElement.StatusType.VALIDATED },
          { id: 2, skillId: 2, status: KnowledgeElement.StatusType.VALIDATED },
        ].map(domainBuilder.buildKnowledgeElement),
        skillIds: [1, 2, 3],
        expected: 67,
      },
      {
        knowledgeElements: [
          { id: 1, skillId: 1, status: KnowledgeElement.StatusType.INVALIDATED },
          { id: 2, skillId: 2, status: KnowledgeElement.StatusType.VALIDATED },
        ].map(domainBuilder.buildKnowledgeElement),
        skillIds: [1, 2, 3, 4],
        expected: 25,
      },
      {
        knowledgeElements: [
          { id: 1, skillId: 1, status: KnowledgeElement.StatusType.INVALIDATED },
          { id: 2, skillId: 2, status: KnowledgeElement.StatusType.VALIDATED },
        ].map(domainBuilder.buildKnowledgeElement),
        skillIds: [],
        expected: 0,
      },
      {
        knowledgeElements: [{ id: 1, skillId: 1, status: KnowledgeElement.StatusType.VALIDATED }].map(
          domainBuilder.buildKnowledgeElement,
        ),
        skillIds: [4],
        expected: 0,
      },
    ];
  });

  describe('getMasteryPercentage', function () {
    it('should return the correct mastery percentage', function () {
      dataSets.forEach((dataSet) => {
        expect(getMasteryPercentage(dataSet.knowledgeElements, dataSet.skillIds)).to.deep.equal(dataSet.expected);
      });
    });
  });
});
