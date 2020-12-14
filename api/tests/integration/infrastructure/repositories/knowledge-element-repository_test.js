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
    let knowledgeElementToSave;

    beforeEach(() => {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      knowledgeElementToSave = domainBuilder.buildKnowledgeElement({
        userId,
        assessmentId,
        answerId,
        competenceId: 'recABC',
      });
      knowledgeElementToSave.id = undefined;

      return databaseBuilder.commit();
    });

    it('should save the knowledgeElement in db', async () => {
      // when
      await knowledgeElementRepository.save(knowledgeElementToSave);

      // then
      let actualKnowledgeElement = await knex.select('*').from('knowledge-elements').first();
      actualKnowledgeElement = _.omit(actualKnowledgeElement, ['id', 'createdAt', 'updatedAt']);
      const expectedKnowledgeElement = _.omit(knowledgeElementToSave, ['id', 'createdAt', 'updatedAt']);
      expect(actualKnowledgeElement).to.deep.equal(expectedKnowledgeElement);
    });

    it('should return a domain object with the id', async () => {
      // when
      const savedKnowledgeElement = await knowledgeElementRepository.save(knowledgeElementToSave);

      // then
      const actualKnowledgeElement = await knex.select('*').from('knowledge-elements').first();
      expect(actualKnowledgeElement).to.deep.equal(savedKnowledgeElement);
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
      databaseBuilder.factory.buildKnowledgeElement({ id: 3, skillId: '3', createdAt: new Date('2020-01-01'), userId, assessmentId });

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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });

      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34Z'),
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
        isShared: false,
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
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
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 2,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        status: 'validated',
        userId: otherUserId,
        skillId: 3,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1, 2]);
    });

    it('should return a list of knowledge elements when there are validated knowledge elements', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill2' });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 'recSkill1',
        createdAt: new Date('2019-12-12T15:00:34Z'),

      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'invalidated',
        userId,
        skillId: 'recSkill2',
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdForSharedCampaignParticipation(campaignId);

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1]);
    });

    it('should return a list of knowledge elements whose its skillId is included in the campaign target profile', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill1' });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        skillId: 'recSkill1',
        status: 'validated',
        userId,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        skillId: 'recSkill2',
        status: 'validated',
        userId,
        createdAt: new Date('2019-12-12T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2020-12-12T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2020-11-11T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });

      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'validated',
        userId: userId2,
        skillId: 13,
        createdAt: new Date('2019-12-12T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });

      const expectedKeIdUser1 = databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      }).id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        status: 'reset',
        userId: userId2,
        skillId: 12,
        createdAt: new Date('2019-12-25T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: otherUserId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 2,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        status: 'validated',
        userId: otherUserId,
        skillId: 3,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(_.map(actualKnowledgeElements, 'id')).to.exactlyContain([1, 2]);
    });

    it('should return only knowledge elements before shared date', async () => {
      // given
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 1 });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2020-12-12T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-13T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'reset',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 3,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-11T15:00:34Z'),
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
        sharedAt: new Date('2020-01-01T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 1,
        status: 'reset',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-13T15:00:34Z'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: 2,
        status: 'validated',
        userId,
        skillId: 1,
        createdAt: new Date('2019-12-12T15:00:34Z'),
      });
      await databaseBuilder.commit();

      // when
      const actualKnowledgeElements = await knowledgeElementRepository.findByCampaignIdAndUserIdForSharedCampaignParticipation({ campaignId, userId });

      // then
      expect(actualKnowledgeElements).to.have.length(0);
    });
  });

  describe('#findSnapshotGroupedByCompetencesForUsers', () => {
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
        const dateUserId1 = new Date('2020-01-03');
        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: userId1, snappedAt: dateUserId1, snapshot: JSON.stringify([knowledgeElement]) });
        await databaseBuilder.commit();

        // when
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementRepository.findSnapshotGroupedByCompetencesForUsers({ [userId1]: dateUserId1 });

        // then
        expect(knowledgeElementsByUserIdAndCompetenceId[userId1][knowledgeElement.competenceId][0]).to.deep.equal(knowledgeElement);
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

  describe('#countValidatedTargetedByCompetencesForOneUser', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return count of validated knowledge elements within limit date for the given user grouped by competences within target profile of campaign', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'skill2', tubeId: 'tube1' });
      const skill3 = domainBuilder.buildTargetedSkill({ id: 'skill3', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1, skill2], competenceId: 'competence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill3], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'competence1', tubes: [tube1], areaId: 'area1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'competence2', tubes: [tube2], areaId: 'area1' });
      const area = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competence1, competence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area],
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const limitDate = new Date('2020-01-03');
      // relevant kes
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId, createdAt: new Date('2020-01-02'), skillId: skill1.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId, createdAt: new Date('2020-01-02'), skillId: skill2.id });
      // ignored kes
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId, createdAt: new Date('2021-01-02') });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, createdAt: new Date('2019-01-02'), skillId: skill1.id });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, limitDate, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId[competence1.id]).to.equal(2);
    });

    context('when user does not have a snapshot for this date', () => {

      context('when no date is provided along with the user', () => {

        it('should take into account all the knowledge elements with a createdAt anterior as now', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: moment.utc().subtract(1, 'minute').toDate(),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

          // then
          const competenceId = targetProfile.competences[0].id;
          expect(knowledgeElementsCountByCompetenceId[competenceId]).to.equal(1);
        });

        it('should not trigger snapshotting', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', () => {

        it('should return the knowledge elements at date', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, new Date('2018-02-01'), targetProfile);

          // then
          expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
            [targetProfile.competences[0].id]: 1,
          });
        });

        it('should save a snasphot', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, new Date('2018-02-01'), targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(1);
        });
      });
    });

    it('should avoid counting non targeted knowledge elements when there are knowledge elements that are not in the target profile', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });

    it('should requalify knowledgeElement under actual targeted competence of skill disregarding indicated competenceId', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: 'competence_depuis_laquelle_lacquis_a_pu_etre_retire',
        skillId: targetProfile.skills[0].id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 1,
      });
    });

    it('should only take into account validated knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: targetProfile.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });

    it('should count 0 on competence that does not have any targeted knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(userId, null, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });
  });

  describe('#countValidatedTargetedByCompetencesForUsers', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return count of validated knowledge elements within limit date for the given users grouped by competences within target profile of campaign', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'skill2', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1], competenceId: 'competence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill2], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'competence1', tubes: [tube1], areaId: 'area1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'competence2', tubes: [tube2], areaId: 'area1' });
      const area = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competence1, competence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area],
      });
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId1, createdAt: new Date('2020-01-02'), skillId: skill1.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: userId2, createdAt: new Date('2019-01-02'), skillId: skill2.id });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId1]: dateUserId1, [userId2]: dateUserId2 }, targetProfile);

      // then
      expect(knowledgeElementsCountCompetenceId).to.deep.equal({
        [competence1.id]: 1,
        [competence2.id]: 1,
      });
    });

    context('when user does not have a snapshot for this date', () => {

      context('when no date is provided along with the user', () => {

        it('should take into account the knowledge elements with limit date as now', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

          // then
          const competenceId = targetProfile.competences[0].id;
          expect(knowledgeElementsCountByCompetenceId[competenceId]).to.equal(1);
        });

        it('should not trigger snapshotting', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', () => {

        it('should return the knowledge elements at date', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsCountByCompetenceId =
            await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

          // then
          expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
            [targetProfile.competences[0].id]: 1,
          });
        });

        it('should save a snasphot', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: new Date('2018-02-01') }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(1);
        });
      });
    });

    it('should avoid counting non targeted knowledge elements when there are knowledge elements that are not in the target profile', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });

    it('should requalify knowledgeElement under actual targeted competence of skill disregarding indicated competenceId', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: 'competence_depuis_laquelle_lacquis_a_pu_etre_retire',
        skillId: targetProfile.skills[0].id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 1,
      });
    });

    it('should avoid counting non validated knowledge elements when there are knowledge elements that are not validated', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: targetProfile.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsCountByCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsCountByCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });

    it('should count 0 on competence that does not have any targeted knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.countValidatedTargetedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId).to.deep.equal({
        [targetProfile.competences[0].id]: 0,
      });
    });
  });

  describe('#findTargetedGroupedByCompetencesForUsers', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return knowledge elements within respective dates grouped by userId the competenceId within target profile of campaign', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'skill2', tubeId: 'tube1' });
      const skill3 = domainBuilder.buildTargetedSkill({ id: 'skill3', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1, skill2], competenceId: 'competence1' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill3], competenceId: 'competence2' });
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'competence1', tubes: [tube1], areaId: 'area1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'competence2', tubes: [tube2], areaId: 'area1' });
      const area = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competence1, competence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area],
      });
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId1, createdAt: new Date('2020-01-02'), skillId: skill1.id });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId1, createdAt: new Date('2020-01-02'), skillId: skill2.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId1, createdAt: new Date('2021-01-02') });
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId2, createdAt: new Date('2019-01-02'), skillId: skill1.id });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence2.id, userId: userId2, createdAt: new Date('2019-01-02'), skillId: skill3.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence1.id, userId: userId2, createdAt: new Date('2020-01-02') });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId1]: dateUserId1, [userId2]: dateUserId2 }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1.id][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1.id].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][competence1.id]).to.deep.include.members([knowledgeElement1_1, knowledgeElement1_2]);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2]).to.deep.equal({
        [competence1.id]: [knowledgeElement2_1],
        [competence2.id]: [knowledgeElement2_2],
      });
    });

    it('should return the knowledge elements in the snapshot when user has a snapshot for this date', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const dateUserId = new Date('2020-01-03');
      const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        competenceId: targetProfile.competences[0].id,
        skillId: targetProfile.skills[0].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt: dateUserId, snapshot: JSON.stringify([knowledgeElement]) });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: dateUserId }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId][targetProfile.competences[0].id][0]).to.deep.equal(knowledgeElement);
    });

    context('when user does not have a snapshot for this date', () => {

      context('when no date is provided along with the user', () => {

        it('should return the knowledge elements with limit date as now', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
            [targetProfile.competences[0].id]: [expectedKnowledgeElement],
          });
        });

        it('should not trigger snapshotting', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', () => {

        it('should return the knowledge elements at date', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: new Date('2018-02-01') }, targetProfile);

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
            [targetProfile.competences[0].id]: [expectedKnowledgeElement],
          });
        });

        it('should save a snasphot', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            competenceId: targetProfile.competences[0].id,
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: new Date('2018-02-01') }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(1);
        });
      });
    });

    it('should avoid returning non targeted knowledge elements when there are knowledge elements that are not in the target profile', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
        [targetProfile.competences[0].id]: [],
      });
    });

    it('should requalify knowledgeElement under actual targeted competence of skill disregarding indicated competenceId', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: 'competence_depuis_laquelle_lacquis_a_pu_etre_retire',
        skillId: targetProfile.skills[0].id,
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
        [targetProfile.competences[0].id]: [expectedKnowledgeElement],
      });
    });

    it('should even return non validated knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        competenceId: targetProfile.competences[0].id,
        skillId: targetProfile.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
        [targetProfile.competences[0].id]: [expectedKnowledgeElement],
      });
    });

    it('should return an empty array on competence that does not have any targeted knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId]).to.deep.equal({
        [targetProfile.competences[0].id]: [],
      });
    });
  });

  describe('#findValidatedTargetedGroupedByTubes', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    it('should return knowledge elements within respective dates grouped by userId and tubeId within target profile of campaign', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'skill1', tubeId: 'tube1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'skill2', tubeId: 'tube1' });
      const skill3 = domainBuilder.buildTargetedSkill({ id: 'skill3', tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skill1, skill2], competenceId: 'competence' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube2', skills: [skill3], competenceId: 'competence' });
      const competence = domainBuilder.buildTargetedCompetence({ id: 'competence', tubes: [tube1, tube2], areaId: 'areaId' });
      const area = domainBuilder.buildTargetedArea({ id: 'areaId', competences: [competence] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3],
        tubes: [tube1, tube2],
        competences: [competence],
        areas: [area],
      });
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const knowledgeElement1_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId1, createdAt: new Date('2020-01-02'), skillId: skill1.id });
      const knowledgeElement1_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId1, createdAt: new Date('2020-01-02'), skillId: skill2.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId1, createdAt: new Date('2021-01-02') });
      const knowledgeElement2_1 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId2, createdAt: new Date('2019-01-02'), skillId: skill1.id });
      const knowledgeElement2_2 = databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId2, createdAt: new Date('2019-01-02'), skillId: skill3.id });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competence.id, userId: userId2, createdAt: new Date('2020-01-02') });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId1]: dateUserId1, [userId2]: dateUserId2 }, targetProfile);

      // then
      expect(knowledgeElementsByTubeId[tube1.id][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByTubeId[tube1.id]).to.deep.include.members([knowledgeElement1_1, knowledgeElement1_2, knowledgeElement2_1]);
      expect(knowledgeElementsByTubeId[tube2.id]).to.deep.include.members([knowledgeElement2_2]);
    });

    it('should return the knowledge elements in the snapshot when user has a snapshot for this date', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const dateUserId = new Date('2020-01-03');
      const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        skillId: targetProfile.skills[0].id,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId, snappedAt: dateUserId, snapshot: JSON.stringify([knowledgeElement]) });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: dateUserId }, targetProfile);

      // then
      expect(knowledgeElementsByTubeId[targetProfile.tubes[0].id][0]).to.deep.equal(knowledgeElement);
    });

    context('when user does not have a snapshot for this date', () => {

      context('when no date is provided along with the user', () => {

        it('should return the knowledge elements with limit date as now', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByTubeId =
            await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: null }, targetProfile);

          // then
          expect(knowledgeElementsByTubeId).to.deep.equal({
            [targetProfile.tubes[0].id]: [expectedKnowledgeElement],
          });
        });

        it('should not trigger snapshotting', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: null }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(0);
        });
      });

      context('when a date is provided along with the user', () => {

        it('should return the knowledge elements at date', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          const expectedKnowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          const knowledgeElementsByTubeId =
            await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: new Date('2018-02-01') }, targetProfile);

          // then
          expect(knowledgeElementsByTubeId).to.deep.equal({
            [targetProfile.tubes[0].id]: [expectedKnowledgeElement],
          });
        });

        it('should save a snasphot', async () => {
          // given
          const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            createdAt: new Date('2018-01-01'),
            skillId: targetProfile.skills[0].id,
          });
          await databaseBuilder.commit();

          // when
          await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: new Date('2018-02-01') }, targetProfile);

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId });
          expect(actualUserSnapshots.length).to.equal(1);
        });
      });
    });

    it('should avoid returning non targeted knowledge elements when there are knowledge elements that are not in the target profile', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        skillId: 'id_de_skill_improbable_et_different_de_celui_du_builder',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [targetProfile.tubes[0].id]: [],
      });
    });

    it('should exclusively return validated knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2018-01-01'),
        skillId: targetProfile.skills[0].id,
        status: 'invalidated',
      });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [targetProfile.tubes[0].id]: [],
      });
    });

    it('should return an empty array on tube that does not have any targeted knowledge elements', async () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByTubeId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByTubes({ [userId]: null }, targetProfile);

      // then
      expect(knowledgeElementsByTubeId).to.deep.equal({
        [targetProfile.tubes[0].id]: [],
      });
    });
  });

  describe('#findSnapshotForUsers', () => {
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

    it('should return knowledge elements within respective dates and users', async () => {
      // given
      const dateUserId1 = new Date('2020-01-03');
      const dateUserId2 = new Date('2019-01-03');
      const user1knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, createdAt: new Date('2020-01-01') });
      const user1knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, createdAt: new Date('2020-01-02') });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, createdAt: new Date('2021-01-02') });
      const user2knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, createdAt: new Date('2019-01-01') });
      const user2knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, createdAt: new Date('2019-01-02') });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, createdAt: new Date('2020-01-02') });
      await databaseBuilder.commit();

      // when
      const knowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: dateUserId1, [userId2]: dateUserId2 });

      // then
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1][0]).to.be.instanceOf(KnowledgeElement);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2].length).to.equal(2);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([user1knowledgeElement1, user1knowledgeElement2]);
      expect(knowledgeElementsByUserIdAndCompetenceId[userId2]).to.deep.include.members([user2knowledgeElement1, user2knowledgeElement2 ]);
    });

    context('when user has a snapshot for this date', () => {

      afterEach(() => {
        sandbox.restore();
      });

      it('should return the knowledge elements in the snapshot', async () => {
        // given
        sandbox.spy(knowledgeElementSnapshotRepository);
        const dateSharedAtUserId1 = new Date('2020-01-03');
        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: userId1 });
        databaseBuilder.factory.buildKnowledgeElementSnapshot({ userId: userId1, snappedAt: dateSharedAtUserId1, snapshot: JSON.stringify([knowledgeElement]) });
        await databaseBuilder.commit();

        // when
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: dateSharedAtUserId1 });

        // then
        expect(knowledgeElementsByUserIdAndCompetenceId[userId1][0]).to.deep.equal(knowledgeElement);
        expect(knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDates).to.have.been.calledWith({ [userId1]: dateSharedAtUserId1 });
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

        it('should return all knowledge elements', async () => {
          // when
          const knowledgeElementsByUserIdAndCompetenceId =
            await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: null });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([expectedKnowledgeElement]);
        });

        it('should not trigger snapshotting', async () => {
          // when
          await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: null });

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
            await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: new Date('2018-02-01') });

          // then
          expect(knowledgeElementsByUserIdAndCompetenceId[userId1]).to.deep.include.members([expectedKnowledgeElement]);
        });

        it('should save a snasphot', async () => {
          // when
          await knowledgeElementRepository.findSnapshotForUsers({ [userId1]: new Date('2018-02-01') });

          // then
          const actualUserSnapshots = await knex.select('*').from('knowledge-element-snapshots').where({ userId: userId1 });
          expect(actualUserSnapshots.length).to.equal(1);
          const actualKnowledgeElements = [];
          for (const knowledgeElementData of actualUserSnapshots[0].snapshot) {
            actualKnowledgeElements.push(new KnowledgeElement({
              ...knowledgeElementData,
              createdAt: new Date(knowledgeElementData.createdAt),
            }));
          }
          expect(actualKnowledgeElements).to.deep.equal([expectedKnowledgeElement]);
        });
      });
    });
  });
});
