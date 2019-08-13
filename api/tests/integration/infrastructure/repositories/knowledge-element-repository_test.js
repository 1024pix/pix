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
      const knowledgeElementsFound = await KnowledgeElementRepository.findByAssessmentId(assessmentId);

      expect(knowledgeElementsFound).have.lengthOf(2);
      expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
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

      knowledgeElementsWantedWithLimitDate = _.map([
        { id: 1, createdAt: yesterday, skillId: '1', userId },
        { id: 2, createdAt: yesterday, skillId: '3', userId, status: 'validated' },
      ], ((ke) => databaseBuilder.factory.buildKnowledgeElement(ke)));

      knowledgeElementsWanted = [
        ...knowledgeElementsWantedWithLimitDate,
        databaseBuilder.factory.buildKnowledgeElement({ id: 3, createdAt: tomorrow, skillId: '2', userId }),
      ];

      _.each([
        { id: 4, createdAt: dayBeforeYesterday, skillId: '3', userId, status: 'invalidated' },
        { id: 5, createdAt: yesterday },
        { id: 6, createdAt: yesterday },
        { id: 7, createdAt: yesterday },
      ], (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when there is no limit date', () => {
      it('should find the knowledge elements for smart placement assessment associated with a user id', async () => {
        // when
        const knowledgeElementsFound = await KnowledgeElementRepository.findUniqByUserId({ userId });

        expect(knowledgeElementsFound).have.lengthOf(3);
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      });
    });

    context('when there is a limit date', () => {
      it('should find the knowledge elements for smart placement assessment associated with a user id created before limit date', async () => {
        // when
        const knowledgeElementsFound = await KnowledgeElementRepository.findUniqByUserId({ userId, limitDate: today });

        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
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

      ], (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find the knowledge elements grouped by competence id', async () => {
      // when
      const actualKnowledgeElementsGroupedByCompetenceId = await KnowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId });

      // then
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.length(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.length(1);
      expect(actualKnowledgeElementsGroupedByCompetenceId[1][0]).to.be.instanceOf(KnowledgeElement);
    });

  });

  describe('#findUniqByUserIdAndCompetenceId', () => {

    let userId;
    let competenceId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = 'fakeId';
      competenceId = 2;

      const today = moment.utc().toDate();
      const yesterday = moment.utc().subtract(1, 'day').toDate();

      _.each([
        { id: 1, competenceId: 1, userId, skillId: 'web1', createdAt: today },
        { id: 2, competenceId, userId, skillId: 'url1', createdAt: today },
        { id: 3, competenceId, userId, skillId: 'url1', createdAt: yesterday },
        { id: 4, competenceId, userId: otherUserId, skillId: 'url2', createdAt: today },
      ], (ke) => {
        databaseBuilder.factory.buildKnowledgeElement(ke);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find the knowledge elements', async () => {
      // when
      const actualKnowledgeElements = await KnowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });

      // then
      expect(actualKnowledgeElements).to.have.length(1);
      expect(actualKnowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
      expect(actualKnowledgeElements[0].id).to.equal(2);
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

      _.each([
        { skillId: 'rec1', userId, earnedPix: 5, competenceId: 1 },
        { skillId: 'rec3', userId, earnedPix: 40, status: 'validated', competenceId: 1 },
        { skillId: 'rec2', userId, earnedPix: 10, status: 'validated', createdAt: today, competenceId: 1 },
        { skillId: 'rec4', userId, earnedPix: 10, status: 'validated', competenceId: 2 },
        { skillId: 'rec5', userId, earnedPix: 10, status: 'validated', competenceId: 3 },
        { skillId: 'rec2', userId, earnedPix: 1000, status: 'validated', createdAt: yesterday },
        { skillId: 'rec2', userId, earnedPix: 1000, status: 'validated', createdAt: yesterday },
        { skillId: 'rec1', userId: userId_tmp, earnedPix: 3, status: 'invalidated' },
      ], (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the right sum of Pix from user knowledge elements', async () => {
      // when
      const earnedPix = await KnowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(userId);

      // then
      expect(earnedPix).to.equal(60);
    });

  });

  describe('findUniqByUserIdAndCompetenceId', () => {
    let wantedKnowledgeElements;
    let userId;
    let otherUserId;
    let competenceId;
    let otherCompetenceId;

    beforeEach(async () => {
      userId = 1;
      otherUserId = 2;
      competenceId = '3';
      otherCompetenceId = '4';

      wantedKnowledgeElements = _.map([
        { id: 1, status: 'validated', userId, competenceId },
        { id: 2, status: 'invalidated', userId, competenceId },
      ], (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      _.each([
        { id: 3, status: 'invalidated', userId, competenceId: otherCompetenceId },
        { id: 4, status: 'validated', userId: otherUserId, competenceId },
        { id: 5, status: 'validated', userId: otherUserId, competenceId: otherCompetenceId },
        { id: 6, status: 'validated', userId, competenceId: null },
      ], (ke) => {
        databaseBuilder.factory.buildKnowledgeElement(ke);
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find only the knowledge elements matching both userId and competenceId', async () => {
      // when
      const actualKnowledgeElements = await KnowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });

      expect(actualKnowledgeElements).to.have.deep.members(wantedKnowledgeElements);

    });

  });
});
