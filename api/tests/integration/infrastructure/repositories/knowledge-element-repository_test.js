const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const KnowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const _ = require('lodash');
const moment = require('moment');

describe('Integration | Repository | KnowledgeElementRepository', () => {

  afterEach(() => {
    return knex('knowledge-elements').delete()
      .then(() => (databaseBuilder.clean()));
  });

  describe('#save', () => {

    let promise;
    let knowledgeElement;

    beforeEach(async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId: 3 }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;

      await databaseBuilder.commit();

      knowledgeElement = domainBuilder.buildKnowledgeElement({
        assessmentId,
        answerId,
        competenceId: 'recABC'
      });
      knowledgeElement.id = undefined;

      // when
      promise = KnowledgeElementRepository.save(knowledgeElement);
    });

    it('should save the knowledgeElement in db', async () => {
      // then
      // id, createdAt, and updatedAt are not present
      const expectedRawKnowledgeElementWithoutIdNorDates = {
        source: knowledgeElement.source,
        status: knowledgeElement.status,
        earnedPix: knowledgeElement.earnedPix,
        answerId: knowledgeElement.answerId,
        assessmentId: knowledgeElement.assessmentId,
        skillId: `${knowledgeElement.skillId}`,
        userId: knowledgeElement.userId,
        competenceId: knowledgeElement.competenceId
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
        .then((savedKnowledgeElement) => {
          expect(savedKnowledgeElement.id).to.not.equal(undefined);
          expect(savedKnowledgeElement).to.be.an.instanceOf(KnowledgeElement);
          expect(_.omit(savedKnowledgeElement, ['id', 'createdAt']))
            .to.deep.equal(_.omit(knowledgeElement, ['id', 'createdAt']));
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
        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId: answer1Id,
        }),
        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId: answer2Id,
        })
      ];
      databaseBuilder.factory.buildKnowledgeElement({
        assessmentId: assessmentIdOther,
        answerId: answer3Id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find the knowledge elements associated with a given assessment', async () => {

      // when
      const promise = KnowledgeElementRepository.findByAssessmentId(assessmentId);

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
        databaseBuilder.factory.buildKnowledgeElement({
          id: 1,
          createdAt: yesterday,
          skillId: '1',
          userId
        }),
        databaseBuilder.factory.buildKnowledgeElement({
          id: 2,
          createdAt: yesterday,
          skillId: '3',
          status: 'validated',
          userId
        })
      ];

      knowledgeElementsWanted = knowledgeElementsWantedWithLimitDate.concat([
        databaseBuilder.factory.buildKnowledgeElement({
          id: 3,
          createdAt: tomorrow,
          skillId: '2',
          userId
        })
      ]);

      databaseBuilder.factory.buildKnowledgeElement({
        id: 4,
        createdAt: dayBeforeYesterday,
        skillId: '3',
        status: 'invalidated'
      });
      databaseBuilder.factory.buildKnowledgeElement({ id: 5, createdAt: yesterday });
      databaseBuilder.factory.buildKnowledgeElement({ id: 6, createdAt: yesterday });
      databaseBuilder.factory.buildKnowledgeElement({ id: 7, createdAt: today });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when there is no limit date', () => {
      it('should find the knowledge elements for smart placement assessment associated with a user id', async () => {
        // when
        const promise = KnowledgeElementRepository.findUniqByUserId({ userId });

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
        const promise = KnowledgeElementRepository.findUniqByUserId({ userId, limitDate: today });

        return promise
          .then((knowledgeElementsFound) => {
            expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
            expect(knowledgeElementsFound).have.lengthOf(2);
          });
      });
    });

  });

  describe('#findUniqByUserIdGroupedByCompetenceId', () => {

    let userId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;

      _.each([
        { id: 1, competenceId: 1, userId, skillId: 'web1' },
        { id: 2, competenceId: 1, userId, skillId: 'web2' },
        { id: 3, competenceId: 2, userId, skillId: 'url1' },
      ], (ke) => {
        databaseBuilder.factory.buildKnowledgeElement(ke);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find the knowledge elements grouped by competence id', async () => {
      // when
      const actualKnowledgeElementsGroupedByCompetenceId = await KnowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId });
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.length(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.length(1);
      expect(actualKnowledgeElementsGroupedByCompetenceId[1][0]).to.be.instanceOf(KnowledgeElement);
    });

  });

  describe('#getSumOfPixFromUserKnowledgeElements', () => {

    let userId;
    const today = new Date('2018-08-01T12:34:56Z');
    const yesterday = moment(today).subtract(1, 'days').toDate();

    beforeEach(async () => {

      // given
      userId = databaseBuilder.factory.buildUser().id;
      const userId_tmp = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        skillId: 'rec1',
        userId,
        earnedPix: 5,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        skillId: 'rec2',
        status: 'validated',
        userId,
        earnedPix: 10,
        createdAt: today,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        skillId: 'rec2',
        userId,
        earnedPix: 1000,
        createdAt: yesterday,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 4,
        skillId: 'rec2',
        status: 'validated',
        userId,
        earnedPix: 1000,
        createdAt: yesterday,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 5,
        skillId: 'rec3',
        userId,
        earnedPix: 3,
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 6,
        skillId: 'rec1',
        status: 'invalidated',
        userId: userId_tmp,
        earnedPix: 500,
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the right sum of Pix from user knowledge elements', async () => {
      // when
      const earnedPix = await KnowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(userId);

      expect(earnedPix).to.equal(18);
    });

  });
});
