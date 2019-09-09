const { expect, domainBuilder } = require('../../../test-helper');
const moment = require('moment');
const _ = require('lodash');

const improvementService = require('../../../../lib/domain/services/improvement-service');

describe('Unit | Service | ImprovementService', () => {

  describe('#filterKnowledgeElementsIfImproving', () => {

    context('when assessment is not improving', () => {
      it('should return the same list of knowledge-elements if assessment is not improving', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'started', isImproving: false });
        const knowledgeElements = [domainBuilder.buildKnowledgeElement()];
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({ assessment, knowledgeElements });

        // then
        expect(listOfKnowledgeElements).to.equal(knowledgeElements);
      });
    });

    context('when assessment is improving', () => {
      let assessment, oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements;
      beforeEach(() => {
        assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement({ state: 'started', isImproving: true, createdAt: moment().format() });
        oldKnowledgeElementsValidated = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
        ];

        oldKnowledgeElementsInvalidated = [
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(4, 'days').format() }),
        ];
        recentKnowledgeElements = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(2, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(2, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(2, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().add(6, 'days').format() }),
        ];
      });

      it('should return the same list of knowledge-elements if assessment is not improving', () => {
        // given
        const knowledgeElements = _.concat(oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements);
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({ assessment, knowledgeElements });

        // then
        expect(listOfKnowledgeElements).to.deep.equal(_.concat(oldKnowledgeElementsValidated, recentKnowledgeElements));
      });

    });

  });

});
