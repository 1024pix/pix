const { expect, domainBuilder } = require('../../../test-helper');
const moment = require('moment');
const _ = require('lodash');

const improvmentService = require('../../../../lib/domain/services/improvment-service');

describe('Unit | Service | ImprovmentService', () => {

  describe('#filterKnowledgeElementsToRemoveThoseWhichCanBeImproved', () => {

    context('when assessment is not improving', () => {
      it('should return the same list of knowledge-elements if assessment is not improving', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'started' });
        const knowledgeElements = [domainBuilder.buildKnowledgeElement()];
        // when
        const listOfKnowledgeElements = improvmentService.filterKnowledgeElementsToRemoveThoseWhichCanBeImproved({ assessment, knowledgeElements });

        // then
        expect(listOfKnowledgeElements).to.equal(knowledgeElements);
      });
    });

    context('when assessment is improving', () => {
      let assessment, oldKnowledgeElementsValidated, oldKnowledgeElementsInvalidated, recentKnowledgeElements;
      beforeEach(() => {
        assessment = domainBuilder.buildAssessment.ofTypeSmartPlacement({ state: 'improving', createdAt: moment().format() });
        oldKnowledgeElementsValidated = [
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
        ];

        oldKnowledgeElementsInvalidated = [
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
        ];
        recentKnowledgeElements = [
          domainBuilder.buildKnowledgeElement({ status: 'invalidated', createdAt: moment().subtract(4, 'days').format() }),
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
        const listOfKnowledgeElements = improvmentService.filterKnowledgeElementsToRemoveThoseWhichCanBeImproved({ assessment, knowledgeElements });

        // then
        expect(listOfKnowledgeElements).to.deep.equal(_.concat(oldKnowledgeElementsValidated, recentKnowledgeElements));
      });

    });

  });

  describe('#verifyIfAssessmentCouldBeImproved', () => {

    context('when assessment is not finished', () => {

      it('should return false', () => {
        // given
        const assessment = domainBuilder.buildAssessment({ state: 'started' });

        // when
        const shouldBeImproved = improvmentService.verifyIfAssessmentCouldBeImproved({ assessment });

        // then
        expect(shouldBeImproved).to.equal(false);
      });
    });

    context('when assessment is completed and knowledgeElements have all skills tested', () => {
      let knowledgeElements, listOfSkillsTested, assessment;
      beforeEach(() => {
        assessment = domainBuilder.buildAssessment({ state: 'completed' });
        listOfSkillsTested = [
          domainBuilder.buildSkill({ id: 'skill1' }),
          domainBuilder.buildSkill({ id: 'skill2' }),
          domainBuilder.buildSkill({ id: 'skill3' }),
        ];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: 'skill1' }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill2' }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill3' })
        ];
      });

      it('should return false', () => {
        // when
        const shouldBeImproved = improvmentService.verifyIfAssessmentCouldBeImproved({ assessment, listOfSkillsTested, knowledgeElements });

        // then
        expect(shouldBeImproved).to.equal(false);
      });

    });

    context('when assessment is completed and knowledgeElements does not have all skills tested', () => {
      let knowledgeElements, listOfSkillsTested, assessment;
      beforeEach(() => {
        assessment = domainBuilder.buildAssessment({ state: 'completed' });
        listOfSkillsTested = [
          domainBuilder.buildSkill({ id: 'skill1' }),
          domainBuilder.buildSkill({ id: 'skill2' }),
          domainBuilder.buildSkill({ id: 'skill3' }),
        ];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: 'skill1' }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill2' }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill4' }),
        ];
      });

      it('should return true', () => {
        // when
        const shouldBeImproved = improvmentService.verifyIfAssessmentCouldBeImproved({ assessment, listOfSkillsTested, knowledgeElements });

        // then
        expect(shouldBeImproved).to.equal(true);
      });

    });

    context('when we can retry a skill', () => {
      let knowledgeElements, listOfSkillsTested, assessment;
      beforeEach(() => {
        assessment = domainBuilder.buildAssessment({ state: 'completed', createdAt: moment().format() });
        listOfSkillsTested = [
          domainBuilder.buildSkill({ id: 'skill1' }),
          domainBuilder.buildSkill({ id: 'skill2' }),
          domainBuilder.buildSkill({ id: 'skill3' }),
        ];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: 'validated', createdAt: moment().subtract(5, 'days').format() }),
          domainBuilder.buildKnowledgeElement({ skillId: 'skill3', status: 'invalidated', createdAt: moment().subtract(5, 'days').format() }),
        ];
      });

      it('should return true', () => {
        // when
        const shouldBeImproved = improvmentService.verifyIfAssessmentCouldBeImproved({ assessment, listOfSkillsTested, knowledgeElements });

        // then
        expect(shouldBeImproved).to.equal(true);
      });

    });

  });

});
