const _ = require('lodash');
const moment = require('moment');
const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const knowledgeElementSnapshotRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');

describe('Integration | Repository | Campaign Participation', () => {

  describe('#get', () => {

    let campaignId, recentAssessmentId;
    let campaignParticipationId, campaignParticipationNotSharedId;

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        isShared: false,
        sharedAt: null
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-01-01T10:00:00Z')
      });

      recentAssessmentId = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-03-01T10:00:00Z')
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId: campaignParticipationNotSharedId,
        createdAt: new Date('2000-02-01T10:00:00Z')
      });

      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async () => {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async () => {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationNotSharedId);

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('should return the campaign participation with its last assessment', async () => {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.assessmentId).to.be.equal(recentAssessmentId);
    });

  });

  describe('#save', () => {

    let campaignId, userId;
    beforeEach(async () => {
      await knex('campaign-participations').delete();
      userId = databaseBuilder.factory.buildUser({}).id;
      campaignId = databaseBuilder.factory.buildCampaign({}).id;

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('campaign-participations').delete();
    });

    it('should return the given campaign participation', async () => {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        campaignId,
        userId,
      });

      // when
      const savedCampaignParticipation = await campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      expect(savedCampaignParticipation).to.be.instanceof(CampaignParticipation);
      expect(savedCampaignParticipation.id).to.exist;
      expect(savedCampaignParticipation.campaignId).to.equal(campaignParticipationToSave.campaignId);
      expect(savedCampaignParticipation.userId).to.equal(campaignParticipationToSave.userId);
    });

    it('should save the given campaign participation', async () => {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        campaignId,
        userId,
        participantExternalId: '034516273645RET'
      });

      // when
      const savedCampaignParticipation = await campaignParticipationRepository.save(campaignParticipationToSave);

      // then
      const campaignParticipationInDB = await knex.select('id', 'campaignId', 'participantExternalId', 'userId')
        .from('campaign-participations')
        .where({ id: savedCampaignParticipation.id });
      expect(campaignParticipationInDB).to.have.length(1);
      expect(campaignParticipationInDB[0].id).to.equal(savedCampaignParticipation.id);
      expect(campaignParticipationInDB[0].campaignId).to.equal(campaignParticipationToSave.campaignId);
      expect(campaignParticipationInDB[0].participantExternalId).to.equal(savedCampaignParticipation.participantExternalId);
      expect(campaignParticipationInDB[0].userId).to.equal(savedCampaignParticipation.userId);
    });

  });

  describe('#count', () => {

    let campaignId;

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;

      _.times(2, () => {
        databaseBuilder.factory.buildCampaignParticipation({});
      });
      _.times(5, () => {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          isShared: true,
        });
      });
      _.times(3, () => {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          isShared: false,
        });
      });

      await databaseBuilder.commit();
    });

    it('should count all campaignParticipations', async () => {
      // when
      const count = await campaignParticipationRepository.count();

      // then
      expect(count).to.equal(10);
    });

    it('should count all campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({ campaignId });

      // then
      expect(count).to.equal(8);
    });

    it('should count all shared campaignParticipations by campaign', async () => {
      // when
      const count = await campaignParticipationRepository.count({
        campaignId,
        isShared: true,
      });

      // then
      expect(count).to.equal(5);
    });
  });

  describe('#findProfilesCollectionResultDataByCampaignId', () => {

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({
        firstName: 'First',
        lastName: 'Last',
      }).id;
      campaign1 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
      campaign2 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId,
        isShared: true,
        createdAt: new Date('2017-03-15T14:59:35Z'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        isShared: true,
      });
      await databaseBuilder.commit();
    });

    it('should return the campaign-participation linked to the given campaign', async () => {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId']));
      expect(attributes).to.deep.equal([
        {
          id: campaignParticipation1.id,
          isShared: true,
          sharedAt: campaignParticipation1.sharedAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
        }
      ]);
    });

    context('when the participant is not linked to a schooling registration', () => {
      it('should return the campaign participation with firstName and lastName from the user', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        // then
        const attributes = participationResultDatas.map((participationResultData) =>
          _.pick(participationResultData, ['participantFirstName', 'participantLastName']));
        expect(attributes).to.deep.equal([{
          participantFirstName: 'First',
          participantLastName: 'Last',
        }]);
      });
    });

    context('when the participant is linked to a schooling registration', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ firstName: 'Hubert', lastName: 'Parterre', userId, organizationId: campaign1.organizationId });
        await databaseBuilder.commit();
      });

      it('should return the campaign participation with firstName and lastName from the schooling registration', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        // then
        const attributes = participationResultDatas.map((participationResultData) =>
          _.pick(participationResultData, ['participantFirstName', 'participantLastName']));
        expect(attributes).to.deep.equal([{
          participantFirstName: 'Hubert',
          participantLastName: 'Parterre',
        }]);
      });
    });

    context('When sharedAt is null', () => {

      it('Should return null as shared date', async () => {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          isShared: false,
          sharedAt: null
        });

        await databaseBuilder.commit();

        // when
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
    });
  });

  describe('findLatestOngoingByUserId', () => {

    let userId;

    beforeEach(async() => {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should retrieve the most recent campaign participations where the campaign is not archived', async () => {
      const campaignId = databaseBuilder.factory.buildCampaign({ createdAt: new Date('2000-01-01T10:00:00Z'), archivedAt: null }).id;
      const moreRecentCampaignId = databaseBuilder.factory.buildCampaign({ createdAt: new Date('2000-02-01T10:00:00Z'), archivedAt: null }).id;
      const mostRecentButArchivedCampaignId = databaseBuilder.factory.buildCampaign({ createdAt: new Date('2001-03-01T10:00:00Z'), archivedAt: new Date('2000-09-01T10:00:00Z') }).id;

      databaseBuilder.factory.buildCampaignParticipation({ userId, createdAt: new Date('2000-04-01T10:00:00Z'), campaignId: moreRecentCampaignId });
      const expectedCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, createdAt: new Date('2000-07-01T10:00:00Z'), campaignId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, createdAt: new Date('2001-08-01T10:00:00Z'), campaignId: mostRecentButArchivedCampaignId });

      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: expectedCampaignParticipationId });
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: expectedCampaignParticipationId });

      await databaseBuilder.commit();

      const latestCampaignParticipations = await campaignParticipationRepository.findLatestOngoingByUserId(userId);
      const [latestCampaignParticipation1, latestCampaignParticipation2] = latestCampaignParticipations;

      expect(latestCampaignParticipation1.createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
      expect(latestCampaignParticipation2.createdAt).to.deep.equal(new Date('2000-04-01T10:00:00Z'));
      expect(latestCampaignParticipation1.assessments).to.be.instanceOf(Array);
      expect(latestCampaignParticipation1.campaign).to.be.instanceOf(Campaign);
      expect(latestCampaignParticipations).to.have.lengthOf(2);
    });

  });

  describe('#findOneByCampaignIdAndUserId', () => {

    let userId;
    let campaignId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;

      campaignId = databaseBuilder.factory.buildCampaign().id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: otherUserId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
        userId,
      });
      await databaseBuilder.commit();
    });

    it('should return the campaign participation found', async () => {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.be.instanceOf(CampaignParticipation);
      expect(response.id).to.deep.equal(campaignParticipation.id);
    });

    it('should return no campaign participation', async () => {
      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.equal(null);
    });
  });

  describe('#findOneByAssessmentIdWithSkillIds', () => {

    const assessmentId = 12345;
    const campaignId = 123;
    const targetProfileId = 456;
    const skillId1 = 'rec1';
    const skillId2 = 'rec2';

    context('when assessment is linked', () => {

      beforeEach(async () => {

        databaseBuilder.factory.buildTargetProfile({ id: targetProfileId });
        databaseBuilder.factory.buildTargetProfileSkill({ skillId: skillId1, targetProfileId });
        databaseBuilder.factory.buildTargetProfileSkill({ skillId: skillId2, targetProfileId });
        databaseBuilder.factory.buildCampaign({ id: campaignId, targetProfileId });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        const otherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, campaignParticipationId: campaignParticipation.id, createdAt: moment().toDate() });
        databaseBuilder.factory.buildAssessment({ id: 67890, campaignParticipationId: otherCampaignParticipation.id, createdAt: moment().subtract(1, 'month').toDate() });

        await databaseBuilder.commit();
      });

      it('should return the campaign-participation linked to the given assessment with skills', async () => {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound.assessmentId).to.deep.equal(assessmentId);
        expect(campaignParticipationFound.campaign.targetProfile.skills).to.have.lengthOf(2);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0].id).to.equal(skillId1);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1].id).to.equal(skillId2);
      });
    });

    context('when assessment is not linked', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({ id: 67890 });
        databaseBuilder.factory.buildCampaignParticipation({ assessmentId: 67890 });

        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound).to.equal(null);
      });
    });
  });

  describe('#findByAssessmentId', () => {

    let assessmentId, wantedCampaignParticipation;

    beforeEach(async () => {
      wantedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ });
      const otherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();

      assessmentId = databaseBuilder.factory.buildAssessment({ campaignParticipationId: wantedCampaignParticipation.id }).id;
      databaseBuilder.factory.buildAssessment({ campaignParticipationId: wantedCampaignParticipation.id });
      databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipation.id });

      await databaseBuilder.commit();
    });

    it('should return campaign participation that match given assessmentId', async function() {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findByAssessmentId(assessmentId);
      // then
      expect(foundCampaignParticipation).to.have.length(1);
      expect(foundCampaignParticipation[0].id).to.equal(wantedCampaignParticipation.id);
    });

  });

  describe('#share', () => {

    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');
    let knowledgeElement;

    beforeEach(async () => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
      });

      knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({ userId: campaignParticipation.userId, createdAt: new Date('1985-09-01T00:00:00Z') });

      sinon.useFakeTimers(frozenTime);

      await databaseBuilder.commit();
      sinon.stub(knowledgeElementSnapshotRepository, 'save');
    });

    afterEach(() => {
      knowledgeElementSnapshotRepository.save.restore();
    });

    it('should return the shared campaign-participation', async () => {
      // when
      const updatedCampaignParticipation = await campaignParticipationRepository.share(campaignParticipation);

      // then
      expect(updatedCampaignParticipation.isShared).to.be.true;
      expect(updatedCampaignParticipation.sharedAt).to.deep.equal(frozenTime);
    });

    it('should save a snapshot', async () => {
      // when
      await campaignParticipationRepository.share(campaignParticipation);

      // then
      sinon.assert.calledWith(knowledgeElementSnapshotRepository.save, {
        userId: campaignParticipation.userId,
        snappedAt: frozenTime,
        knowledgeElements: [new KnowledgeElement(knowledgeElement)],
      });
    });
  });

  describe('#countSharedParticipationOfCampaign', () => {

    it('counts the number of campaign participation shared for a campaign', async () => {
      const campaignId = databaseBuilder.factory.buildCampaign({}).id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({}).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false, });
      databaseBuilder.factory.buildCampaignParticipation({ otherCampaignId, isShared: true, });

      await databaseBuilder.commit();

      const  numberOfCampaignShared = await campaignParticipationRepository.countSharedParticipationOfCampaign(campaignId);

      expect(numberOfCampaignShared).to.equal(1);
    });
  });

});
