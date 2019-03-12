const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const SmartPlacementKnowledgeElementRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-knowledge-element-repository');
const _ = require('lodash');
const moment = require('moment');

describe('Integration | Repository | SmartPlacementKnowledgeElementRepository', () => {

  const SMART_PLACEMENT = 'SMART_PLACEMENT';
  const PLACEMENT = 'PLACEMENT';

  afterEach(() => {
    return knex('knowledge-elements').delete()
      .then(() => (databaseBuilder.clean()));
  });

  describe('#save', () => {

    let promise;
    let smartPlacementKnowledgeElement;

    beforeEach(async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId: 3 }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;

      await databaseBuilder.commit();

      smartPlacementKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        assessmentId,
        answerId,
        competenceId: 'recABC'
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
        earnedPix: smartPlacementKnowledgeElement.earnedPix,
        answerId: smartPlacementKnowledgeElement.answerId,
        assessmentId: smartPlacementKnowledgeElement.assessmentId,
        skillId: `${smartPlacementKnowledgeElement.skillId}`,
        userId: smartPlacementKnowledgeElement.userId,
        competenceId: smartPlacementKnowledgeElement.competenceId
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
          expect(_.omit(savedSmartPlacementKnowledgeElement, ['id', 'createdAt']))
            .to.deep.equal(_.omit(smartPlacementKnowledgeElement, ['id', 'createdAt']));
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
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId, answerId: answer1Id, createdAt: '' }),
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId, answerId: answer2Id, createdAt: '' })
      ];
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ assessmentId: assessmentIdOther, answerId: answer3Id });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find the knowledge elements associated with a given assessment', async () => {

      // when
      const promise = SmartPlacementKnowledgeElementRepository.findByAssessmentId(assessmentId);

      return promise
        .then((knowledgeElementsFound) => {
          expect(knowledgeElementsFound).have.lengthOf(2);
          expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
        });
    });
  });

  describe('#findUniqByUserId', () => {

    const today = new Date('2018-08-01T12:34:56Z');
    const yesterday = moment(today).subtract(1, 'days').toDate();
    const tomorrow = moment(today).add(1, 'days').toDate();
    const dayBeforeYesterday = moment(today).subtract(2, 'days').toDate();

    let knowledgeElementsWanted, knowledgeElementsWantedWithLimitDate;
    let userId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;

      knowledgeElementsWantedWithLimitDate = [
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 1, createdAt: yesterday, skillId: '1' , userId}),
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 2, createdAt: yesterday, skillId: '3', status: 'validated', userId })
      ];

      knowledgeElementsWanted = knowledgeElementsWantedWithLimitDate.concat([
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 3, createdAt: tomorrow, skillId: '2', userId })
      ]);

      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 4, createdAt: dayBeforeYesterday, skillId: '3', status: 'invalidated' }),
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 5, createdAt: yesterday }),
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 6, createdAt: yesterday }),
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ id: 7, createdAt: today });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when there is no limit date', () => {
      it('should find the knowledge elements for smart placement assessment associated with a user id', async () => {
        // when
        const promise = SmartPlacementKnowledgeElementRepository.findUniqByUserId(userId);

        return promise
          .then((knowledgeElementsFound) => {
            expect(knowledgeElementsFound).have.lengthOf(3);
            expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
          });
      });
    });

    context('when there is a limit date', () => {
      it('should find the knowledge elements for smart placement assessment associated with a user id created before limit date', async () => {
        // when
        const promise = SmartPlacementKnowledgeElementRepository.findUniqByUserId(userId, today);

        return promise
          .then((knowledgeElementsFound) => {
            expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
            expect(knowledgeElementsFound).have.lengthOf(2);
          });
      });
    });

  });
});
