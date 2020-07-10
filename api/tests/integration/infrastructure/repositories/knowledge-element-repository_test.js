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

  describe('#findUniqByUserIdGroupedByCompetenceIdWithSnapshot', () => {
    const sandbox = sinon.createSandbox();
    let userId;
    let expectedKnowledgeElementsFirstCompetence;
    let expectedKnowledgeElementsSecondCompetence;
    let outOfLimitDateKnowledgeElement;
    const beforeDate = new Date('2020-01-01');
    const afterDate = new Date('2020-01-03');

    beforeEach(() => {
      sandbox.spy(knowledgeElementRepository);
      sandbox.spy(knowledgeElementSnapshotRepository);
      userId = databaseBuilder.factory.buildUser().id;

      expectedKnowledgeElementsFirstCompetence = [];
      expectedKnowledgeElementsFirstCompetence.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId, createdAt: beforeDate }));
      expectedKnowledgeElementsFirstCompetence.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId, createdAt: beforeDate }));
      expectedKnowledgeElementsSecondCompetence = [];
      expectedKnowledgeElementsSecondCompetence.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec2', userId, createdAt: beforeDate }));
      outOfLimitDateKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec2', userId, createdAt: afterDate });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      sandbox.restore();
      return knex('knowledge-element-snapshots').delete();
    });

    context('when a limitDate is provided', () => {
      const limitDate = new Date('2020-01-02');

      it('should try to check for a snapshot', async () => {
        // when
        await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId, limitDate });

        // then
        expect(knowledgeElementSnapshotRepository.findOneByUserIdAndDate.calledOnce).to.be.true;
        expect(knowledgeElementSnapshotRepository.findOneByUserIdAndDate).to.have.been.calledWith({ userId, date: limitDate });
      });

      context('when a snapshot exists', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            userId,
            createdAt: limitDate,
            snapshot: JSON.stringify([...expectedKnowledgeElementsFirstCompetence, ...expectedKnowledgeElementsSecondCompetence]),
          });
          return databaseBuilder.commit();
        });

        it('should return the expected knowledge elements grouped by competence', async () => {
          // when
          const actualKnowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId, limitDate });

          // then
          expect(actualKnowledgeElementsGroupedByCompetenceId['rec1'][0]).to.be.instanceOf(KnowledgeElement);
          expect(actualKnowledgeElementsGroupedByCompetenceId).to.deep.equal({
            'rec1': expectedKnowledgeElementsFirstCompetence,
            'rec2': expectedKnowledgeElementsSecondCompetence,
          });
        });

        it('should return knowledge elements extracted from the snapshot without saving any new one', async () => {
          // when
          await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId, limitDate });

          // then
          expect(knowledgeElementRepository.findUniqByUserId.notCalled).to.be.true;
          expect(knowledgeElementSnapshotRepository.save.notCalled).to.be.true;
        });
      });

      context('when no snapshot exists', () => {

        it('should return the expected knowledge elements grouped by competence', async () => {
          // when
          const actualKnowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId, limitDate });

          // then
          expect(actualKnowledgeElementsGroupedByCompetenceId['rec1'][0]).to.be.instanceOf(KnowledgeElement);
          expect(actualKnowledgeElementsGroupedByCompetenceId).to.deep.equal({
            'rec1': expectedKnowledgeElementsFirstCompetence,
            'rec2': expectedKnowledgeElementsSecondCompetence,
          });
          expect(knowledgeElementRepository.findUniqByUserId.calledOnce).to.be.true;
          expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({ userId, limitDate });
        });

        it('should save the snapshot', async () => {
          // when
          await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId, limitDate });

          // then
          expect(knowledgeElementSnapshotRepository.save.calledOnce).to.be.true;
        });
      });
    });

    context('when no limitDate is provided', () => {
      it('should directly fetch the expected knowledge elements without interacting with snapshots at all', async () => {
        // when
        const actualKnowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceIdWithSnapshot({ userId });

        // then
        expect(actualKnowledgeElementsGroupedByCompetenceId['rec1'][0]).to.be.instanceOf(KnowledgeElement);
        expect(actualKnowledgeElementsGroupedByCompetenceId).to.deep.equal({
          'rec1': expectedKnowledgeElementsFirstCompetence,
          'rec2': [outOfLimitDateKnowledgeElement, ...expectedKnowledgeElementsSecondCompetence],
        });
        expect(knowledgeElementSnapshotRepository.findOneByUserIdAndDate.notCalled).to.be.true;
        expect(knowledgeElementSnapshotRepository.save.notCalled).to.be.true;
      });
    });

  });

  describe('#findUniqByUserIdsAndDatesGroupedByCompetenceIdWithSnapshot', () => {
    const sandbox = sinon.createSandbox();
    let userIdWithSnapshot;
    let expectedKnowledgeElementsFirstCompetenceUserWithSnapshot;
    let expectedKnowledgeElementsSecondCompetenceUserWithSnapshot;
    const beforeDateUserWithSnapshot = new Date('2020-01-01');
    const limitDateUserWithSnapshot = new Date('2020-01-02');
    let userIdWithoutSnapshot;
    let expectedKnowledgeElementsFirstCompetenceUserWithoutSnapshot;
    let expectedKnowledgeElementsThirdCompetenceUserWithoutSnapshot;
    const beforeDateUserWithoutSnapshot = new Date('2020-02-01');
    const afterDateUserWithoutSnapshot = new Date('2020-02-03');
    const limitDateUserWithoutSnapshot = new Date('2020-02-02');
    let userIdWithoutDate;
    let expectedKnowledgeElementsFirstCompetenceUserWithoutDate;
    let args;

    beforeEach(() => {
      sandbox.spy(knowledgeElementRepository);
      sandbox.spy(knowledgeElementSnapshotRepository);

      userIdWithSnapshot = databaseBuilder.factory.buildUser().id;
      expectedKnowledgeElementsFirstCompetenceUserWithSnapshot = [];
      expectedKnowledgeElementsFirstCompetenceUserWithSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithSnapshot, createdAt: beforeDateUserWithSnapshot }));
      expectedKnowledgeElementsFirstCompetenceUserWithSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithSnapshot, createdAt: beforeDateUserWithSnapshot }));
      expectedKnowledgeElementsSecondCompetenceUserWithSnapshot = [];
      expectedKnowledgeElementsSecondCompetenceUserWithSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec2', userId: userIdWithSnapshot, createdAt: beforeDateUserWithSnapshot }));
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: userIdWithSnapshot,
        createdAt: limitDateUserWithSnapshot,
        snapshot: JSON.stringify([...expectedKnowledgeElementsFirstCompetenceUserWithSnapshot, ...expectedKnowledgeElementsSecondCompetenceUserWithSnapshot]),
      });

      userIdWithoutSnapshot = databaseBuilder.factory.buildUser().id;
      expectedKnowledgeElementsFirstCompetenceUserWithoutSnapshot = [];
      expectedKnowledgeElementsFirstCompetenceUserWithoutSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithoutSnapshot, createdAt: beforeDateUserWithoutSnapshot }));
      expectedKnowledgeElementsFirstCompetenceUserWithoutSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithoutSnapshot, createdAt: beforeDateUserWithoutSnapshot }));
      expectedKnowledgeElementsThirdCompetenceUserWithoutSnapshot = [];
      expectedKnowledgeElementsThirdCompetenceUserWithoutSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec3', userId: userIdWithoutSnapshot, createdAt: beforeDateUserWithoutSnapshot }));
      expectedKnowledgeElementsThirdCompetenceUserWithoutSnapshot.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec3', userId: userIdWithoutSnapshot, createdAt: beforeDateUserWithoutSnapshot }));
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec2', userId: userIdWithoutSnapshot, createdAt: afterDateUserWithoutSnapshot });

      userIdWithoutDate = databaseBuilder.factory.buildUser().id;
      expectedKnowledgeElementsFirstCompetenceUserWithoutDate = [];
      expectedKnowledgeElementsFirstCompetenceUserWithoutDate.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithoutDate, createdAt: new Date('2019-01-01') }));
      expectedKnowledgeElementsFirstCompetenceUserWithoutDate.push(databaseBuilder.factory.buildKnowledgeElement({ competenceId: 'rec1', userId: userIdWithoutDate, createdAt: new Date('2019-01-01') }));

      args = {
        [userIdWithSnapshot]: limitDateUserWithSnapshot,
        [userIdWithoutSnapshot]: limitDateUserWithoutSnapshot,
        [userIdWithoutDate]: null,
      };
      return databaseBuilder.commit();
    });

    afterEach(() => {
      sandbox.restore();
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return the expected knowledge elements grouped by competence by user', async () => {
      // when
      const actualKnowledgeElementsGroupedByCompetenceIdByUser =
          await knowledgeElementRepository.findUniqByUserIdsAndDatesGroupedByCompetenceIdWithSnapshot(args);

      // then
      expect(actualKnowledgeElementsGroupedByCompetenceIdByUser[userIdWithSnapshot]['rec1'][0]).to.be.instanceOf(KnowledgeElement);
      expect(actualKnowledgeElementsGroupedByCompetenceIdByUser).to.deep.equal({
        [userIdWithSnapshot]: {
          'rec1': expectedKnowledgeElementsFirstCompetenceUserWithSnapshot,
          'rec2': expectedKnowledgeElementsSecondCompetenceUserWithSnapshot,
        },
        [userIdWithoutSnapshot]: {
          'rec1': expectedKnowledgeElementsFirstCompetenceUserWithoutSnapshot,
          'rec3': expectedKnowledgeElementsThirdCompetenceUserWithoutSnapshot,
        },
        [userIdWithoutDate]: {
          'rec1': expectedKnowledgeElementsFirstCompetenceUserWithoutDate,
        },
      });
    });

    it('should have save a snapshot when the user does not have one but have provided a date', async () => {
      // when
      await knowledgeElementRepository.findUniqByUserIdsAndDatesGroupedByCompetenceIdWithSnapshot(args);

      // then
      // TODO vérifier les arguments du save
      expect(knowledgeElementSnapshotRepository.save.calledOnce).to.be.true;
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({ userId: userIdWithoutSnapshot, limitDate: limitDateUserWithoutSnapshot });
    });

    it('should not save a snapshot when the user neither have one and provided date', async () => {
      // when
      await knowledgeElementRepository.findUniqByUserIdsAndDatesGroupedByCompetenceIdWithSnapshot(args);

      // then
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({ userId: userIdWithoutDate, limitDate: null });
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

  describe('findByCampaignIdForSharedCampaignParticipation', () => {
    let userId, targetProfileId, campaignId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
    });

    it('should have the skill Id', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 12 });
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
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(actualKnowledgeElements[0].skillId).to.equal('12');
    });

    it('should return nothing when there is no shared campaign participations', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: false
      });

      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(actualKnowledgeElements).to.be.empty;
    });

    it('should return a list of knowledge elements when there are shared campaign participations', async () => {
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
        isShared: false,
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
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1,2]);
    });

    it('should return a list of knowledge elements when there are validated knowledge elements', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId:  'recSkill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId:  'recSkill2' });
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
        skillId:  'recSkill1',
        createdAt: new Date('2019-12-12T15:00:34'),

      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'invalidated',
        userId,
        skillId:  'recSkill2',
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should return a list of knowledge elements whose its skillId is included in the campaign target profile', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId:  'recSkill1' });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        skillId:  'recSkill1',
        status: 'validated',
        userId,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        skillId:  'recSkill2',
        status: 'validated',
        userId,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
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
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should return only last knowledge element for a skill', async () => {
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
        createdAt: new Date('2020-11-11T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should return latest knowledge elements by skill for each user in the campaign', async () => {
      // given
      const userId2 = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 12 });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 13 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });

      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId: userId2,
        skillId: 13,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(actualKnowledgeElements).to.have.length(3);
    });

    it('should return only last knowledge element if validated for a skill within sharedAt date', async () => {
      // given
      const userId2 = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 12 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });

      const expectedKeIdUser1 = databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34'),
      }).id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'reset',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-25T15:00:34'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(actualKnowledgeElements).to.have.length(1);
      expect(actualKnowledgeElements[0].id).to.equal(expectedKeIdUser1);
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
});
