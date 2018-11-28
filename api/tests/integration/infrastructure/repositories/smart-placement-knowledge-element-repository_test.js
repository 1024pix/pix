const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const SmartPlacementKnowledgeElementRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-knowledge-element-repository');
const _ = require('lodash');

describe('Integration | Repository | SmartPlacementKnowledgeElementRepository', () => {

  afterEach(() => {
    return knex('knowledge-elements').delete()
      .then(() => (databaseBuilder.clean()));
  });

  describe('#save', () => {

    let promise;
    let smartPlacementKnowledgeElement;

    beforeEach(async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;

      await databaseBuilder.commit();

      smartPlacementKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        assessmentId,
        answerId,
      });
      smartPlacementKnowledgeElement.id = undefined;

      // when
      promise = SmartPlacementKnowledgeElementRepository.save(smartPlacementKnowledgeElement);
    });

    it('should save the smartPlacementKnowledgeElement in db', async () => {
      // then
      // id, createdAt, and updatedAt are not present
      const expectedRawKnowledgeElementWithoutIdNorDates = {
        source: smartPlacementKnowledgeElement.source,
        status: smartPlacementKnowledgeElement.status,
        pixScore: smartPlacementKnowledgeElement.pixScore,
        answerId: smartPlacementKnowledgeElement.answerId,
        assessmentId: smartPlacementKnowledgeElement.assessmentId,
        skillId: `${smartPlacementKnowledgeElement.skillId}`,
      };
      return promise
        .then(() => knex('knowledge-elements').first())
        .then((knowledgeElement) => _.omit(knowledgeElement, ['id', 'createdAt', 'updatedAt']))
        .then((knowledgeElementWithoutIdNorDates) => {
          return expect(knowledgeElementWithoutIdNorDates).to.deep.equal(expectedRawKnowledgeElementWithoutIdNorDates);
        });
    });

    it('should return a domain object with the id', async () => {
      // then
      return promise
        .then((savedSmartPlacementKnowledgeElement) => {
          expect(savedSmartPlacementKnowledgeElement.id).to.not.equal(undefined);
          expect(savedSmartPlacementKnowledgeElement).to.be.an.instanceOf(SmartPlacementKnowledgeElement);
          expect(_.omit(savedSmartPlacementKnowledgeElement, ['id']))
            .to.deep.equal(_.omit(smartPlacementKnowledgeElement, ['id']));
        });
    });
  });

  describe('#findByAssessmentId', () => {

    let knowledgeElementsWanted;
    let assessmentId;

    beforeEach(async () => {
      // given
      assessmentId = databaseBuilder.factory.buildAssessment().id;
      const assessmentIdOther = databaseBuilder.factory.buildAssessment().id;
      const answer1Id = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      const answer2Id = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      const answer3Id = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentIdOther }).id;

      knowledgeElementsWanted = [
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId, answerId: answer1Id, createdAt: null }),
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId, answerId: answer2Id, createdAt: null })
      ];
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId: assessmentIdOther, answerId: answer3Id });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should save the smartPlacementKnowledgeElement in db', async () => {

      // when
      const promise = SmartPlacementKnowledgeElementRepository.findByAssessmentId(assessmentId);

      return promise
        .then((knowledgeElementsFound) => {
          expect(knowledgeElementsFound).have.lengthOf(2);
          expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
        });
    });
  });
})
;
