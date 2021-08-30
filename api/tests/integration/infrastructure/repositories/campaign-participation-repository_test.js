const _ = require('lodash');
const moment = require('moment');
const { sinon, expect, knex, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const Skill = require('../../../../lib/domain/models/Skill');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Campaign Participation', function() {

  describe('#get', function() {

    let campaignId, recentAssessmentId;
    let campaignParticipationId, campaignParticipationNotSharedId;
    let campaignParticipationAssessments;
    beforeEach(async function() {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, validatedSkillsCount: 12 }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        isShared: false,
        sharedAt: null,
      }).id;

      const assessment1 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-01-01T10:00:00Z'),
      });

      const assessment2 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-03-01T10:00:00Z'),
      });

      databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId: campaignParticipationNotSharedId,
        createdAt: new Date('2000-02-01T10:00:00Z'),
      });

      campaignParticipationAssessments = [assessment1, assessment2];
      recentAssessmentId = assessment2.id;

      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async function() {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async function() {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationNotSharedId);

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('should return the campaign participation with its last assessment', async function() {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.assessmentId).to.be.equal(recentAssessmentId);
    });

    it('returns the assessments of campaignParticipation', async function() {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });

  });

  describe('#save', function() {

    let campaignId, userId;
    beforeEach(async function() {
      await knex('campaign-participations').delete();
      userId = databaseBuilder.factory.buildUser({}).id;
      campaignId = databaseBuilder.factory.buildCampaign({}).id;

      await databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('campaign-participations').delete();
    });

    it('should return the given campaign participation', async function() {
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

    it('should save the given campaign participation', async function() {
      // given
      const campaignParticipationToSave = new CampaignParticipation({
        campaignId,
        userId,
        participantExternalId: '034516273645RET',
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

  describe('update', function() {
    it('save the changes of the campaignParticipation', async function() {
      const campaignParticipationId = 12;
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({ id: campaignParticipationId, isShared: false, sharedAt: null, validatedSkillsCount: null });

      await databaseBuilder.commit();

      await campaignParticipationRepository.update({
        ...campaignParticipationToUpdate,
        isShared: true,
        sharedAt: new Date('2021-01-01'),
        validatedSkillsCount: 10,
        pixScore: 10,
        masteryPercentage: 0.9,
      });
      const campaignParticipation = await knex('campaign-participations').where({ id: campaignParticipationId }).first();

      expect(campaignParticipation.isShared).to.equals(true);
      expect(campaignParticipation.sharedAt).to.deep.equals(new Date('2021-01-01'));
      expect(campaignParticipation.validatedSkillsCount).to.equals(10);
      expect(campaignParticipation.pixScore).to.equals(10);
      expect(campaignParticipation.masteryPercentage).to.equals('0.90');
    });
  });

  describe('markPreviousParticipationsAsImproved', function() {
    it('marks previous participations as improved', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ multipleSendings: true }).id;
      const oldCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: false }).id;

      await databaseBuilder.commit();

      await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.markPreviousParticipationsAsImproved(campaignId, userId, domainTransaction);
      });

      const campaignParticipation = await knex('campaign-participations').where({ id: oldCampaignParticipationId }).first();

      expect(campaignParticipation.isImproved).to.equals(true);
    });

    it('does not change the campaign participations when an error occurred during the transaction', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ multipleSendings: true }).id;
      const oldCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, isShared: true, sharedAt: new Date('2020-01-01'), isImproved: false }).id;

      await databaseBuilder.commit();
      try {
        await DomainTransaction.execute(async (domainTransaction) => {
          await campaignParticipationRepository.markPreviousParticipationsAsImproved(campaignId, userId, domainTransaction);
          throw new Error();
        });
        // eslint-disable-next-line no-empty
      } catch {}

      const campaignParticipation = await knex('campaign-participations').where({ id: oldCampaignParticipationId }).first();

      expect(campaignParticipation.isImproved).to.equals(false);
    });
  });

  describe('hasAlreadyParticipated', function() {
    it('returns true', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });

      await databaseBuilder.commit();

      const result = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.hasAlreadyParticipated(campaignId, userId, domainTransaction);
      });

      expect(result).to.equals(true);
    });

    it('returns false', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      await databaseBuilder.commit();
      const result = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.hasAlreadyParticipated(campaignId, userId, domainTransaction);
      });

      expect(result).to.equals(false);
    });
  });

  describe('findParticipantExternalId', function() {
    it('returns participantExternalId', async function() {
      const participantExternalId = 'kékédu26';
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, participantExternalId });
      await databaseBuilder.commit();

      const result = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.findParticipantExternalId(campaignId, userId, domainTransaction);
      });

      expect(result).to.equals(participantExternalId);
    });

    it('returns null when participantExternalId is null', async function() {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, participantExternalId: null });

      await databaseBuilder.commit();
      const result = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.findParticipantExternalId(campaignId, userId, domainTransaction);
      });

      expect(result).to.equals(null);
    });

    it('returns undefined when no participation is found', async function() {
      const otherCampaignId = '999';
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, participantExternalId: '123' });

      await databaseBuilder.commit();
      const result = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.findParticipantExternalId(otherCampaignId, userId, domainTransaction);
      });

      expect(result).to.equals(undefined);
    });
  });

  describe('#count', function() {

    let campaignId;

    beforeEach(async function() {
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

    it('should count all campaignParticipations', async function() {
      // when
      const count = await campaignParticipationRepository.count();

      // then
      expect(count).to.equal(10);
    });

    it('should count all campaignParticipations by campaign', async function() {
      // when
      const count = await campaignParticipationRepository.count({ campaignId });

      // then
      expect(count).to.equal(8);
    });

    it('should count all shared campaignParticipations by campaign', async function() {
      // when
      const count = await campaignParticipationRepository.count({
        campaignId,
        isShared: true,
      });

      // then
      expect(count).to.equal(5);
    });
  });

  describe('#findProfilesCollectionResultDataByCampaignId', function() {

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let userId;

    beforeEach(async function() {
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

    it('should return the campaign-participation linked to the given campaign', async function() {
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
        },
      ]);
    });

    context('when the participant is not linked to a schooling registration', function() {
      it('should return the campaign participation with firstName and lastName from the user', async function() {
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

    context('when the participant is linked to a schooling registration', function() {
      beforeEach(async function() {
        databaseBuilder.factory.buildSchoolingRegistration({ firstName: 'Hubert', lastName: 'Parterre', userId, organizationId: campaign1.organizationId, division: '6emeD' });
        await databaseBuilder.commit();
      });

      it('should return the campaign participation with firstName and lastName from the schooling registration', async function() {
        // given
        const campaignId = campaign1.id;

        // when
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        // then
        const attributes = participationResultDatas.map((participationResultData) =>
          _.pick(participationResultData, ['participantFirstName', 'participantLastName', 'division']));
        expect(attributes).to.deep.equal([{
          participantFirstName: 'Hubert',
          participantLastName: 'Parterre',
          division: '6emeD',
        }]);
      });
    });

    context('when a participant has several schooling-registrations for different organizations', function() {
      let campaign;
      let otherCampaign;

      beforeEach(async function() {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        otherCampaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
        }).id;
        const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          userId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        databaseBuilder.factory.buildAssessment({ otherCampaignParticipationId, userId });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, userId, division: '3eme' });
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId: otherOrganizationId, division: '2nd' });

        await databaseBuilder.commit();
      });

      it('should return the division of the school registration linked to the campaign', async function() {
        const campaignParticipationInfos = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        expect(campaignParticipationInfos.length).to.equal(1);
        expect(campaignParticipationInfos[0].division).to.equal('3eme');
      });
    });

    context('When the participant has improved its participation', function() {
      let campaignId, improvedCampaignParticipation;

      beforeEach(async function() {
        campaignId = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION, multipleSendings: true }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          userId,
          isShared: true,
          createdAt: new Date('2016-01-15T14:59:35Z'),
          isImproved: true,
        });
        improvedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          userId,
          isShared: true,
          createdAt: new Date('2016-07-15T14:59:35Z'),
          isImproved: false,
        });
        await databaseBuilder.commit();
      });

      it('should return the non improved campaign-participation', async function() {
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        expect(participationResultDatas.length).to.eq(1);
        expect(participationResultDatas[0].id).to.eq(improvedCampaignParticipation.id);
      });
    });

    context('When sharedAt is null', function() {

      it('Should return null as shared date', async function() {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          isShared: false,
          sharedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const participationResultDatas = await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
    });
  });

  describe('#findLatestOngoingByUserId', function() {

    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should retrieve the most recent campaign participations where the campaign is not archived', async function() {
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

  describe('#findOneByCampaignIdAndUserId', function() {

    let userId;
    let campaignId;

    beforeEach(async function() {
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

    it('should return the campaign participation found', async function() {
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
      expect(response.id).to.equal(campaignParticipation.id);
    });

    it('should return the non improved campaign participation found', async function() {
      // given
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        isImproved: true,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });

      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.be.instanceOf(CampaignParticipation);
      expect(response.id).to.equal(campaignParticipation.id);
    });

    it('should return no campaign participation', async function() {
      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.equal(null);
    });
  });

  describe('#findOneByAssessmentIdWithSkillIds', function() {

    const assessmentId = 12345;
    const campaignId = 123;
    const targetProfileId = 456;
    const skillId1 = 'rec1';
    const skillId2 = 'rec2';

    context('when assessment is linked', function() {

      beforeEach(async function() {

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

      it('should return the campaign-participation linked to the given assessment with skills', async function() {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound.assessmentId).to.equal(assessmentId);
        expect(campaignParticipationFound.campaign.targetProfile.skills).to.have.lengthOf(2);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[0].id).to.equal(skillId1);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1]).to.be.instanceOf(Skill);
        expect(campaignParticipationFound.campaign.targetProfile.skills[1].id).to.equal(skillId2);
      });
    });

    context('when assessment is not linked', function() {

      beforeEach(async function() {
        databaseBuilder.factory.buildAssessment({ id: 67890 });
        databaseBuilder.factory.buildCampaignParticipation({ assessmentId: 67890 });

        await databaseBuilder.commit();
      });

      it('should return null', async function() {
        // when
        const campaignParticipationFound = await campaignParticipationRepository.findOneByAssessmentIdWithSkillIds(assessmentId);

        // then
        expect(campaignParticipationFound).to.equal(null);
      });
    });
  });

  describe('#updateWithSnapshot', function() {
    let clock;
    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async function() {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
      });

      databaseBuilder.factory.buildKnowledgeElement({ userId: campaignParticipation.userId, createdAt: new Date('1985-09-01T00:00:00Z') });
      clock = sinon.useFakeTimers(frozenTime);

      await databaseBuilder.commit();
    });

    afterEach(function() {
      clock.restore();
      return knex('knowledge-element-snapshots').delete();
    });

    it('persists the campaign-participation changes', async function() {
      // given
      campaignParticipation.campaign = {};
      campaignParticipation.assessments = [];
      campaignParticipation.user = {};
      campaignParticipation.assessmentId = {};
      campaignParticipation.isShared = true;
      campaignParticipation.participantExternalId = 'Laura';

      // when
      await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

      const updatedCampaignParticipation = await knex('campaign-participations').where({ id: campaignParticipation.id }).first();
      // then
      expect(updatedCampaignParticipation.isShared).to.be.true;
      expect(updatedCampaignParticipation.participantExternalId).to.equals('Laura');
    });

    it('should save a snapshot', async function() {
      // given
      campaignParticipation.sharedAt = new Date();

      // when
      await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

      // then
      const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
      expect(snapshotInDB).to.have.length(1);
    });
  });

  describe('#countSharedParticipationOfCampaign', function() {

    it('counts the number of campaign participation shared for a campaign', async function() {
      const campaignId = databaseBuilder.factory.buildCampaign({}).id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({}).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false });
      databaseBuilder.factory.buildCampaignParticipation({ otherCampaignId, isShared: true });

      await databaseBuilder.commit();

      const numberOfCampaignShared = await campaignParticipationRepository.countSharedParticipationOfCampaign(campaignId);

      expect(numberOfCampaignShared).to.equal(1);
    });
  });

  describe('#isAssessmentCompleted', function() {

    it('should return true when latest assessment is completed', async function() {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      // oldest assessment
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, state: Assessment.states.STARTED, createdAt: new Date('2019-01-04') });
      // latest assessment
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, state: Assessment.states.COMPLETED, createdAt: new Date('2019-02-05') });
      // noise
      databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipationId, state: Assessment.states.STARTED, createdAt: new Date('2019-04-05') });
      await databaseBuilder.commit();

      // when
      const isAssessmentCompleted = await campaignParticipationRepository.isAssessmentCompleted(campaignParticipationId);

      // then
      expect(isAssessmentCompleted).to.be.true;
    });

    it('should return false when latest assessment is not completed', async function() {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      // oldest assessment
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, state: Assessment.states.COMPLETED, createdAt: new Date('2019-01-04') });
      // latest assessment
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, state: Assessment.states.STARTED, createdAt: new Date('2019-02-05') });
      await databaseBuilder.commit();

      // when
      const isAssessmentCompleted = await campaignParticipationRepository.isAssessmentCompleted(campaignParticipationId);

      // then
      expect(isAssessmentCompleted).to.be.false;
    });

    it('should return false when campaignParticipation has no assessment', async function() {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      // when
      const isAssessmentCompleted = await campaignParticipationRepository.isAssessmentCompleted(campaignParticipationId);

      // then
      expect(isAssessmentCompleted).to.be.false;
    });
  });

  describe('#isRetrying', function() {
    let campaignId;
    let campaignParticipationId;
    let userId;

    beforeEach(async function() {
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    context('When the user has just one participation shared', function() {
      beforeEach(async function() {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: new Date('2002-10-10') }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has just one participation not shared', function() {
      beforeEach(async function() {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: null }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but all shared', function() {
      beforeEach(async function() {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: true, sharedAt: new Date('2002-10-10') });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: new Date('2002-10-10') }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but not in the same campaign', function() {
      beforeEach(async function() {
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, userId, isImproved: true, sharedAt: new Date('2002-10-10') });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, userId, isImproved: false, sharedAt: null });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: null }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When there is several participations but not for the same user', function() {
      beforeEach(async function() {
        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: otherUserId, isImproved: true, sharedAt: new Date('2002-10-10') });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: otherUserId, isImproved: false, sharedAt: null });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: null }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user is retrying the campaign', function() {
      beforeEach(async function() {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: true, sharedAt: new Date('2002-10-10') });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, isImproved: false, sharedAt: null }).id;
        await databaseBuilder.commit();
      });

      it('returns true', async function() {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.true;
      });
    });
  });

  describe('#countParticipationsByStage', function() {
    let campaignId;

    const stagesBoundaries = [
      { id: 1, from: 0, to: 4 },
      { id: 2, from: 5, to: 9 },
      { id: 3, from: 10, to: 19 },
    ];

    beforeEach(async function() {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('returns an empty object when no participations', async function() {
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

      expect(result).to.deep.equal({});
    });

    it('returns the distribution for the campaign', async function() {
      databaseBuilder.factory.buildCampaignParticipation({ masteryPercentage: 0 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0 });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

      expect(result).to.deep.equal({ '1': 1, '2': 0, '3': 0 });
    });

    it('returns the distribution for only isImproved=false participations', async function() {
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0, isImproved: false });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0, isImproved: true });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

      expect(result).to.deep.equal({ '1': 1, '2': 0, '3': 0 });
    });

    it('returns the distribution of participations by stage', async function() {
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0.05 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0.06 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0.10 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0.12 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryPercentage: 0.19 });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

      expect(result).to.deep.equal({ '1': 1, '2': 2, '3': 3 });
    });
  });

  describe('#countParticipationsByStatus', function() {
    describe('For assessment campaign', function() {
      let campaignId;
      let campaignType;

      beforeEach(async function() {
        const campaign = databaseBuilder.factory.buildCampaign();
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function() {
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ started: 0, completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function() {
        it('returns an object with 1 participation shared', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ isShared: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });

        it('returns an object with 1 participation shared and isImproved=false', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function() {
        it('returns an object with 1 participation completed', async function() {
          const idSomeParticipation = databaseBuilder.factory.buildCampaignParticipation({ isShared: false }).id;
          const idParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idSomeParticipation });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation, createdAt: new Date('2010-01-01') });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });

        it('returns an object with 1 participation completed and isImproved=false', async function() {
          const idSomeParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false, isImproved: true }).id;
          const idParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idSomeParticipation });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });
      });

      describe('Count started Participation', function() {
        it('returns an object with 1 participation started', async function() {
          const idSomeParticipation = databaseBuilder.factory.buildCampaignParticipation({ isShared: false }).id;
          const idParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idSomeParticipation, state: Assessment.states.STARTED });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation, state: Assessment.states.STARTED, createdAt: new Date('2010-01-01') });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation, state: Assessment.states.STARTED });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });

        it('returns an object with 1 participation started and isImproved=false', async function() {
          const idSomeParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false, isImproved: true }).id;
          const idParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;

          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idSomeParticipation, state: Assessment.states.STARTED });
          databaseBuilder.factory.buildAssessment({ campaignParticipationId: idParticipation, state: Assessment.states.STARTED });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });
      });
    });

    describe('For profile collection campaign', function() {
      let campaignId;
      let campaignType;

      beforeEach(async function() {
        const campaign = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function() {
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function() {
        it('returns an object with 1 participation shared', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ isShared: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });

        it('returns an object with 1 participation shared and isImproved=false', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function() {
        it('returns an object with 1 participation completed', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ isShared: false });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });

        it('returns an object with 1 participation completed and isImproved=false', async function() {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });
      });
    });
  });
});
