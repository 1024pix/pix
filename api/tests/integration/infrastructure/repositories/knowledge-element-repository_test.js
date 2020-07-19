const _ = require('lodash');
const moment = require('moment');
const { expect, knex, domainBuilder, databaseBuilder, sinon } = require('../../../test-helper');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');

describe('Integration | Repository | knowledgeElementRepository', () => {

  afterEach(() => {
    return knex('knowledge-elements').delete();
  });

  describe('#save', () => {

    let promise;
    let knowledgeElement;

    beforeEach(async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;

      await databaseBuilder.commit();

      knowledgeElement = domainBuilder.buildKnowledgeElement({
        userId,
        assessmentId,
        answerId,
        competenceId: 'recABC'
      });
      knowledgeElement.id = undefined;

      // when
      promise = knowledgeElementRepository.save(knowledgeElement);
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

    context('when there is no limit date', () => {
      it('should find the knowledge elements for campaign assessment associated with a user id', async () => {
        // when
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId });

        expect(knowledgeElementsFound).have.lengthOf(3);
        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      });
    });

    context('when there is a limit date', () => {
      it('should find the knowledge elements for campaign assessment associated with a user id created before limit date', async () => {
        // when
        const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserId({ userId, limitDate: today });

        expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWantedWithLimitDate);
        expect(knowledgeElementsFound).have.lengthOf(2);
      });
    });

  });

  describe('#findUniqByUserIdAndAssessmentId', () => {

    let knowledgeElementsWanted;
    let userId, assessmentId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const otherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;

      knowledgeElementsWanted = _.map([
        { id: 1, skillId: '1', userId, assessmentId },
        { id: 2, skillId: '3', createdAt: new Date('2020-02-01'), userId, assessmentId },
      ], ((ke) => databaseBuilder.factory.buildKnowledgeElement(ke)));

      databaseBuilder.factory.buildKnowledgeElement({ id: 4, skillId: '5', userId, assessmentId: otherAssessmentId });
      databaseBuilder.factory.buildKnowledgeElement({ id: 3, skillId: '3', createdAt: new Date('2020-01-01'), userId, assessmentId },);

      await databaseBuilder.commit();
    });

    it('should find the knowledge elements for assessment associated with a user id', async () => {
      // when
      const knowledgeElementsFound = await knowledgeElementRepository.findUniqByUserIdAndAssessmentId({ userId, assessmentId });

      // then
      expect(knowledgeElementsFound).to.have.deep.members(knowledgeElementsWanted);
      expect(knowledgeElementsFound).have.lengthOf(2);
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

    it('should find the knowledge elements grouped by competence id', async () => {
      // when
      const actualKnowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId });

      // then
      expect(actualKnowledgeElementsGroupedByCompetenceId[1]).to.have.length(2);
      expect(actualKnowledgeElementsGroupedByCompetenceId[2]).to.have.length(1);
      expect(actualKnowledgeElementsGroupedByCompetenceId[1][0]).to.be.instanceOf(KnowledgeElement);
    });

  });

  describe('findUniqByUserIdAndCompetenceId', () => {
    let wantedKnowledgeElements;
    let userId;
    let otherUserId;
    let competenceId;
    let otherCompetenceId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      otherUserId = databaseBuilder.factory.buildUser().id;
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

    it('should find only the knowledge elements matching both userId and competenceId', async () => {
      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });

      expect(actualKnowledgeElements).to.have.deep.members(wantedKnowledgeElements);

    });

  });

  describe('findByCampaignIdAndUserIdForSharedCampaignParticipation', () => {
    let userId, targetProfileId, campaignId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
    });

    it('should return a list of knowledge elements for a given user', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 2 });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 3 });
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: otherUserId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 2,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        status: 'validated',
        userId: otherUserId,
        skillId: 3,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1,2]);
    });

    it('should return only knowledge elements before shared date', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2020-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should return only last knowledge element if validated for a skill within sharedAt date', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-13T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'reset',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-11T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should not return any knowledge element if latest by skill is not validated', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'reset',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-13T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(actualKnowledgeElements).to.have.length(0);
    });
  });

  describe('#findUniqByUserIdsAndDatesGroupedByCompetenceIdWithSnapshot', () => {
    const sandbox = sinon.createSandbox();
    let userId1;
    let userId2;

    beforeEach(() => {
      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return knowledge elements within respective dates grouped by userId the competenceId', async () => {
      // given
      const competence1 = 'competenceId1';
      const competence2 = 'competenceId2';
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1, userId: userId1, createdAt: new Date('2020-01-01') });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1, userId: userId1, createdAt: new Date('2020-01-02') });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1, userId: userId1, createdAt: new Date('2021-01-02') });
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1, userId: userId2, createdAt: new Date('2019-01-01') });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2, userId: userId2, createdAt: new Date('2019-01-02') });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1, userId: userId2, createdAt: new Date('2020-01-02') });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: dateUserId1, [userId2]: dateUserId2 });

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1]).to.deep.include.members([knowledgeElement1_1, knowledgeElement1_2]);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2]).to.deep.equal({
        [competence1]: [knowledgeElement2_1],
        [competence2]: [knowledgeElement2_2],
      });
    });

    context('when user has a snapshot for this date', () => {

      afterEach(() => {
        sandbox.restore();
      });

      it('should return the knowledge elements in the snapshot', async () => {
        // given
        sandbox.spy(knowledgeElementSnapshotRepository);
        const dateUserId1 = new Date('2020-01-03');
        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: userId1, snappedAt: dateUserId1, snapshot: JSON.stringify([knowledgeElement]) });
        await databaseBuilder.commit();

        // when
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: dateUserId1 });

        // then
        expect(knowledgeElementsByUserIdAndCompetenceId[userId1][knowledgeElement.competenceId][0]).to.deep.equal(knowledgeElement);
        expect(knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates).to.have.been.calledWith({ [userId1]: dateUserId1 });
        await expect(knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates.firstCall.returnValue).to.eventually.deep.equal({
          [userId1]: [knowledgeElement],
        });
      });
    });

    context('when user does not have a snapshot for this date', () => {

      context('when no date is provided along with the user', () => {
        let expectedKnowledgeElement;

        beforeEach(() => {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, createdAt: new Date('2018-01-01') });
          return databaseBuilder.commit();
        });

        it('should return the knowledge elements with limit date as now', async () => {
          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: null });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.equal({
            [expectedKnowledgeElement.competenceId]: [expectedKnowledgeElement],
          });
        });

        it('should not trigger snapshotting', async () => {
          // when
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: null });

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId: userId1 });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', () => {
        let expectedKnowledgeElement;

        beforeEach(() => {
          expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, createdAt: new Date('2018-01-01') });
          return databaseBuilder.commit();
        });

        it('should return the knowledge elements at date', async () => {
          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: new Date('2018-02-01') });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.equal({
            [expectedKnowledgeElement.competenceId]: [expectedKnowledgeElement],
          });
        });

        it('should save a snasphot', async () => {
          // when
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: new Date('2018-02-01') });

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId: userId1 });
          expect(actualUserSnapshots.length).to.equal(1);
        });
      });
    });
  });
});
