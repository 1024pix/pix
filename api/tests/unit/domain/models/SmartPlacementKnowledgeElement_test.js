const { expect, factory } = require('../../../test-helper');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

describe('Unit | Domain | Models | SmartPlacementKnowledgeElement', () => {

  describe('#isValidated', () => {

    it('should be true if status validated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.true;
    });

    it('should be false if status not validated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.false;
    });
  });

  describe('#isInValidated', () => {

    it('should be true if status invalidated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.true;
    });

    it('should be false if status not invalidated', () => {
      // given
      const knowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.false;
    });
  });
});
