const { expect, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');

const improvementService = require('../../../../lib/domain/services/improvement-service');

describe('Unit | Service | ImprovementService', function() {

  describe('#filterKnowledgeElementsIfImproving', function() {

    context('when assessment is not improving', function() {
      it('should return the same list of knowledge-elements if assessment is not improving', function() {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'started', isImproving: false });
        const knowledgeElements = [domainBuilder.buildKnowledgeElement()];
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({ assessment, knowledgeElements });

        // then
        expect(listOfKnowledgeElements).to.equal(knowledgeElements);
      });
    });

    context('when assessment is improving', function() {
      let assessment, oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements;
      beforeEach(function() {
        const assessmentDate = '2020-07-30';
        const fiveDaysBeforeAssesmentDate = '2020-07-25';
        const fourDaysBeforeAssesmentDate = '2020-07-26';
        const twoDaysBeforeAssesmentDate = '2020-07-28';
        const twoDaysAfterAssesmentDate = '2020-08-02';
        assessment = domainBuilder.buildAssessment.ofTypeCampaign({ state: 'started', isImproving: true, createdAt: assessmentDate });
        oldKnowledgeElementsValidated = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: fiveDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: fiveDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: fiveDaysBeforeAssesmentDate }),
        ];

        oldKnowledgeElementsInvalidated = [
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: fiveDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: fiveDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: fiveDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: fourDaysBeforeAssesmentDate }),
        ];
        recentKnowledgeElements = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: twoDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: twoDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: twoDaysBeforeAssesmentDate }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: twoDaysAfterAssesmentDate }),
        ];
      });

      it('should return the same list of knowledge-elements if assessment is not improving', function() {
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
