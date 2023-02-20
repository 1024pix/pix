import { expect, domainBuilder } from '../../../test-helper';
import _ from 'lodash';
import improvementService from '../../../../lib/domain/services/improvement-service';
import constants from '../../../../lib/domain/constants';

describe('Unit | Service | ImprovementService', function () {
  describe('#filterKnowledgeElementsIfImproving', function () {
    context('when assessment is not improving', function () {
      it('should return the same list of knowledge-elements if assessment is not improving', function () {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'started', isImproving: false });
        const knowledgeElements = [domainBuilder.buildKnowledgeElement()];

        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({
          assessment,
          knowledgeElements,
          isRetrying: false,
        });

        // then
        expect(listOfKnowledgeElements).to.equal(knowledgeElements);
      });
    });

    context('when the campaign participation is retrying', function () {
      let assessment, knowledgeElements;
      let originalConstantValue;

      beforeEach(function () {
        originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
        constants['MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING'] = 3;
        const assessmentDate = '2020-07-30';

        assessment = domainBuilder.buildAssessment.ofTypeCampaign({
          state: 'started',
          isImproving: true,
          createdAt: assessmentDate,
        });

        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: '2020-07-26' }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: '2020-07-27' }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: '2020-07-28' }),
        ];
      });

      afterEach(function () {
        constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = originalConstantValue;
      });

      it('should return the same list of knowledge-elements if assessment is not improving', function () {
        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({
          assessment,
          knowledgeElements,
          isRetrying: true,
        });

        // then
        expect(_.map(listOfKnowledgeElements, 'createdAt')).to.exactlyContain(['2020-07-26', '2020-07-28']);
      });
    });

    context('when assessment is improving', function () {
      let assessment, oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements;
      beforeEach(function () {
        const assessmentDate = '2020-07-30';
        const fiveDaysBeforeAssesmentDate = '2020-07-25';
        const fourDaysBeforeAssesmentDate = '2020-07-26';
        const twoDaysBeforeAssesmentDate = '2020-07-28';
        const twoDaysAfterAssesmentDate = '2020-08-02';
        assessment = domainBuilder.buildAssessment.ofTypeCampaign({
          state: 'started',
          isImproving: true,
          createdAt: assessmentDate,
        });
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

      it('should return validated knowledge elements and knowledge elements not validated but created less than 4 days', function () {
        // given
        const knowledgeElements = _.concat(
          oldKnowledgeElementsValidated,
          oldKnowledgeElementsInvalidated,
          recentKnowledgeElements
        );

        // when
        const listOfKnowledgeElements = improvementService.filterKnowledgeElementsIfImproving({
          assessment,
          knowledgeElements,
          isRetrying: false,
        });

        // then
        expect(listOfKnowledgeElements).to.deep.equal(_.concat(oldKnowledgeElementsValidated, recentKnowledgeElements));
      });
    });
  });
});
