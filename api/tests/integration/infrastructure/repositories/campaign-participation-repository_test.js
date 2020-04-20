const _ = require('lodash');
const moment = require('moment');
const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');

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
        type: 'SMART_PLACEMENT',
        campaignParticipationId,
        createdAt: new Date('2000-01-01T10:00:00Z')
      });

      recentAssessmentId = databaseBuilder.factory.buildAssessment({
        type: 'SMART_PLACEMENT',
        campaignParticipationId,
        createdAt: new Date('2000-03-01T10:00:00Z')
      }).id;

      databaseBuilder.factory.buildAssessment({
        type: 'SMART_PLACEMENT',
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

  describe('#findAssessmentResultDataByCampaignId', () => {

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({
        firstName: 'First',
        lastName: 'Last',
      }).id;
      campaign1 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });
      campaign2 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId,
        isShared: true,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        isShared: true,
      });
      await databaseBuilder.commit();
    });

    it('should return all the campaign-participation links to the given campaign', async () => {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas = await campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaignId);

      // then
      expect(participationResultDatas).to.deep.equal([
        {
          id: campaignParticipation1.id,

          isShared: true,
          sharedAt: campaignParticipation1.sharedAt,
          createdAt: campaignParticipation1.createdAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
          isCompleted: false,
          participantFirstName: 'First',
          participantLastName: 'Last',
        }
      ]);
    });

    context('When last assessment is completed', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-02'),
          state: 'completed',

        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-01'),
          state: 'started',
        });
        await databaseBuilder.commit();
      });

      it('Should return True for isCompleted', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const participationResultDatas = await campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaignId);

        // then
        expect(participationResultDatas).to.deep.equal([
          {
            id: campaignParticipation1.id,

            isShared: true,
            sharedAt: campaignParticipation1.sharedAt,
            createdAt: campaignParticipation1.createdAt,
            participantExternalId: campaignParticipation1.participantExternalId,
            userId: campaignParticipation1.userId,
            isCompleted: true,
            participantFirstName: 'First',
            participantLastName: 'Last',
          }
        ]);
      });
    });

    context('When the last assessment is not completed', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-01'),
          state: 'completed',
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-02'),
          state: 'started',
        });
        await databaseBuilder.commit();
      });
      it('Should return false for isCompleted', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const participationResultDatas = await campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaignId);

        // then
        expect(participationResultDatas).to.deep.equal([
          {
            id: campaignParticipation1.id,

            isShared: true,
            sharedAt: campaignParticipation1.sharedAt,
            createdAt: campaignParticipation1.createdAt,
            participantExternalId: campaignParticipation1.participantExternalId,
            userId: campaignParticipation1.userId,
            isCompleted: false,
            participantFirstName: 'First',
            participantLastName: 'Last',
          }
        ]);
      });
    });

    context('When the share at is null', () => {
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
        const participationResultDatas = await campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaign.id);

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
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

    it('should return the campaign-participation links to the given campaign', async () => {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId', 'participantFirstName', 'participantLastName']));
      expect(attributes).to.deep.equal([
        {
          id: campaignParticipation1.id,
          isShared: true,
          sharedAt: campaignParticipation1.sharedAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
          participantFirstName: 'First',
          participantLastName: 'Last',
        }
      ]);
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

  describe('#findPaginatedCampaignParticipations', () => {

    const assessmentId1 = 1;
    const assessmentId2 = 2;
    let campaignId;

    const oldDate = new Date('2018-02-03');
    const recentDate = new Date('2018-05-06');
    const futurDate = new Date('2018-07-10');

    beforeEach(async () => {

      const pixMembers = [
        {
          firstName: 'Mélanie',
          lastName: 'Darboo',
          assessmentId: assessmentId2,
          knowledgeElements: [
            { skillId: '@web3', createdAt: oldDate },
            { skillId: '@web3', createdAt: oldDate },
            { skillId: '@web4', createdAt: oldDate },
            { skillId: '@web5', createdAt: futurDate },
          ]
        },
        { firstName: 'Matteo', lastName: 'Lorenzio', knowledgeElements: [] },
        {
          firstName: 'Jérémy',
          lastName: 'Bugietta',
          assessmentId: assessmentId1,
          knowledgeElements: [
            { skillId: '@web2', createdAt: oldDate },
            { skillId: '@web1', createdAt: oldDate },
          ]
        },
        { firstName: 'Léo', lastName: 'Subzéro', knowledgeElements: [] },
      ];

      campaignId = databaseBuilder.factory.buildCampaign().id;
      const insertPixMember = (member) => {
        const { id: userId } = databaseBuilder.factory.buildUser(member);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, sharedAt: recentDate });
        databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId, id: member.assessmentId });
        for (const ke of member.knowledgeElements) {
          databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, });
        }
      };

      pixMembers.forEach(insertPixMember);

      await databaseBuilder.commit();
    });

    it('should return paginated campaign participations including users sorted by name, lastname, their assessment and uniq knowledge elements', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: { number: 1, size: 2 } };
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();
      const foundAssessmentIds = _.map(foundCampaignParticipation.models, 'assessmentId');
      const foundKnowledgeElementsSkillsIds = _(foundCampaignParticipation.models).map('user').map('knowledgeElements').flatten().map('skillId').value();
      // then
      expect(foundUserLastNames).to.deep.equal(['Bugietta', 'Darboo']);
      expect(foundAssessmentIds).to.deep.equal([assessmentId1, assessmentId2]);
      expect(foundKnowledgeElementsSkillsIds).to.have.members(['@web1', '@web2', '@web3', '@web4']);
      expect(foundCampaignParticipation.models[0].assessmentId).to.equal(assessmentId1);
      expect(foundCampaignParticipation.models[0].user.knowledgeElements[0]).to.be.instanceOf(KnowledgeElement);
    });

    it('should return paginated campaign participations sorted by lastname and firstname', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: {} };
      const { id: userId } = databaseBuilder.factory.buildUser({ lastName: 'Bugietta', firstName: 'Anna' });

      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, sharedAt: recentDate, createdAt: recentDate });
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId });
      await databaseBuilder.commit();

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();
      const foundUserFirstNames = _(foundCampaignParticipation.models).map('user').map('firstName').value();

      // then
      expect(foundUserLastNames).to.deep.equal(['Bugietta', 'Bugietta', 'Darboo', 'Lorenzio', 'Subzéro']);
      expect(foundUserFirstNames).to.deep.equal(['Anna', 'Jérémy', 'Mélanie', 'Matteo', 'Léo']);
    });

    it('should return paginated campaign participations sorted with no case sensitive', async () => {
      // given
      const options = { filter: { campaignId }, sort: [], include: ['user'], page: {} };
      const { id: userId } = databaseBuilder.factory.buildUser({ lastName: 'BUGIETTA', firstName: 'Anna' });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, sharedAt: recentDate, createdAt: recentDate });
      databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId });

      await databaseBuilder.commit();

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.findPaginatedCampaignParticipations(options);
      const foundUserLastNames = _(foundCampaignParticipation.models).map('user').map('lastName').value();

      // then
      expect(foundUserLastNames).to.deep.equal(['BUGIETTA', 'Bugietta', 'Darboo', 'Lorenzio', 'Subzéro']);
    });
  });

  describe('#share', () => {

    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async () => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
      });

      sinon.useFakeTimers(frozenTime);

      await databaseBuilder.commit();
    });

    it('should return the shared campaign-participation', () => {
      // when
      const promise = campaignParticipationRepository.share(campaignParticipation);

      // then
      return promise.then((updatedCampaignParticipation) => {
        expect(updatedCampaignParticipation.isShared).to.be.true;
        expect(updatedCampaignParticipation.sharedAt).to.deep.equal(frozenTime);
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
