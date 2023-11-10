import _ from 'lodash';
import { sinon, expect, knex, databaseBuilder, catchErr } from '../../../test-helper.js';
import { Campaign } from '../../../../lib/domain/models/Campaign.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { CampaignParticipation } from '../../../../lib/domain/models/CampaignParticipation.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation', function () {
  describe('#hasAssessmentParticipations', function () {
    let userId;
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return true if the user has participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the user does not have participations', async function () {
      // given
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: otherUser.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return false if the user does not have participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#getCodeOfLastParticipationToProfilesCollectionCampaignForUser', function () {
    let userId;
    const expectedCode = 'GOOD';
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return null if there is no participations', async function () {
      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations to share', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: SHARED,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if participations are deleted', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        deletedAt: new Date(),
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no campaigns of type profiles collection', async function () {
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations for the user', async function () {
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId: otherUser.id,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if campaign is archived', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', archivedAt: new Date() });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return code of the last participation to a campaign of type PROFILES_COLLECTION for the user', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: expectedCode });
      const otherCampaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'BAD' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaign.id,
        status: TO_SHARE,
        createdAt: new Date(Date.parse('11/11/2011')),
        userId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(Date.parse('12/11/2011')),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(expectedCode);
    });
  });

  describe('#get', function () {
    let campaignId;
    let campaignParticipationId, campaignParticipationNotSharedId;
    let campaignParticipationAssessments;
    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        validatedSkillsCount: 12,
      }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: STARTED,
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

      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationNotSharedId);

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('returns the assessments of campaignParticipation', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });

    it('returns the campaign of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // then
      expect(foundCampaignParticipation.campaign.id).to.equal(campaignId);
    });

    it('returns the assessments of campaignParticipation using the transaction', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
      });
      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });
  });

  describe('update', function () {
    it('save the changes of the campaignParticipation', async function () {
      const campaignParticipationId = 12;
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        status: STARTED,
        sharedAt: null,
      });

      await databaseBuilder.commit();

      await campaignParticipationRepository.update({
        ...campaignParticipationToUpdate,
        sharedAt: new Date('2021-01-01'),
        status: SHARED,
      });
      const campaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipationId })
        .first();

      expect(campaignParticipation.sharedAt).to.deep.equals(new Date('2021-01-01'));
      expect(campaignParticipation.status).to.equals(SHARED);
    });

    it('should not update because the leaner can not have 2 active participations for the same campaign', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId });
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
      });

      await databaseBuilder.commit();

      const error = await catchErr(campaignParticipationRepository.update)({
        ...campaignParticipationToUpdate,
        campaignId,
      });

      expect(error.constraint).to.equals('one_active_participation_by_learner');
    });
  });

  describe('#findProfilesCollectionResultDataByCampaignId', function () {
    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaign1 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });
      campaign2 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId, firstName: 'Hubert', lastName: 'Parterre', division: '6emeD' },
        {
          campaignId: campaign1.id,
          createdAt: new Date('2017-03-15T14:59:35Z'),
        },
      );
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
      });
      await databaseBuilder.commit();
    });

    it('should return the campaign-participation linked to the given campaign', async function () {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId']),
      );
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

    it('should not return the deleted campaign-participation linked to the given campaign', async function () {
      // given
      const campaignId = campaign1.id;
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId, firstName: 'Piere', lastName: 'Pi air', division: '6emeD' },
        {
          campaignId: campaign1.id,
          createdAt: new Date('2017-03-15T14:59:35Z'),
          deletedAt: new Date(),
        },
      );
      await databaseBuilder.commit();

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId']),
      );
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

    it('should return the campaign participation with firstName and lastName from the organization learner', async function () {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['participantFirstName', 'participantLastName', 'division']),
      );
      expect(attributes).to.deep.equal([
        {
          participantFirstName: 'Hubert',
          participantLastName: 'Parterre',
          division: '6emeD',
        },
      ]);
    });

    context('when a participant has several organization-learners for different organizations', function () {
      let campaign;
      let otherCampaign;

      beforeEach(async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        otherCampaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: '3eme',
        }).id;
        const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          division: '2nd',
        }).id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, organizationLearnerId });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          organizationLearnerId: otherOrganizationLearnerId,
        });

        await databaseBuilder.commit();
      });

      it('should return the division of the school registration linked to the campaign', async function () {
        const campaignParticipationInfos =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        expect(campaignParticipationInfos.length).to.equal(1);
        expect(campaignParticipationInfos[0].division).to.equal('3eme');
      });
    });

    context('When the participant has improved its participation', function () {
      let campaignId, improvedCampaignParticipation;

      beforeEach(async function () {
        campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          multipleSendings: true,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          createdAt: new Date('2016-01-15T14:59:35Z'),
          isImproved: true,
        });
        improvedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          createdAt: new Date('2016-07-15T14:59:35Z'),
          isImproved: false,
        });
        await databaseBuilder.commit();
      });

      it('should return the non improved campaign-participation', async function () {
        const participationResultDatas =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        expect(participationResultDatas.length).to.eq(1);
        expect(participationResultDatas[0].id).to.eq(improvedCampaignParticipation.id);
      });
    });

    context('When sharedAt is null', function () {
      it('Should return null as shared date', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: STARTED,
          sharedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const participationResultDatas =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
    });
  });

  describe('#findLatestOngoingByUserId', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });
    it('should only retrieve participations from user', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign({
        createdAt: new Date('2000-01-01T10:00:00Z'),
        archivedAt: null,
      }).id;
      const otherUserId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: otherUserId,
        campaignId,
      });
      await databaseBuilder.commit();

      const latestCampaignParticipations = await campaignParticipationRepository.findLatestOngoingByUserId(userId);

      expect(latestCampaignParticipations.length).to.equal(1);
    });

    it('should retrieve the most recent campaign participations where the campaign is not archived', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign({
        createdAt: new Date('2000-01-01T10:00:00Z'),
        archivedAt: null,
      }).id;
      const moreRecentCampaignId = databaseBuilder.factory.buildCampaign({
        createdAt: new Date('2000-02-01T10:00:00Z'),
        archivedAt: null,
      }).id;
      const mostRecentButArchivedCampaignId = databaseBuilder.factory.buildCampaign({
        createdAt: new Date('2001-03-01T10:00:00Z'),
        archivedAt: new Date('2000-09-01T10:00:00Z'),
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        createdAt: new Date('2000-04-01T10:00:00Z'),
        campaignId: moreRecentCampaignId,
      });
      const expectedCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        createdAt: new Date('2000-07-01T10:00:00Z'),
        campaignId,
      }).id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        createdAt: new Date('2001-08-01T10:00:00Z'),
        campaignId: mostRecentButArchivedCampaignId,
      });

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

  describe('#findOneByCampaignIdAndUserId', function () {
    let userId;
    let campaignId;

    beforeEach(async function () {
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

    it('should return the campaign participation found', async function () {
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

    it('should return the non improved campaign participation found', async function () {
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

    it('should include assessments found too', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });
      const assessment = databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id });
      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response.assessments).to.have.lengthOf(1);
      expect(response.assessments[0]).to.be.instanceOf(Assessment);
      expect(response.assessments[0].id).to.equal(assessment.id);
    });

    it('should return no campaign participation', async function () {
      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.equal(null);
    });
  });

  describe('#updateWithSnapshot', function () {
    let clock;
    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async function () {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        status: STARTED,
        sharedAt: null,
      });

      databaseBuilder.factory.buildKnowledgeElement({
        userId: campaignParticipation.userId,
        createdAt: new Date('1985-09-01T00:00:00Z'),
      });
      clock = sinon.useFakeTimers(frozenTime);

      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('persists the campaign-participation changes', async function () {
      // given
      campaignParticipation.campaign = {};
      campaignParticipation.assessments = [];
      campaignParticipation.user = {};
      campaignParticipation.assessmentId = {};
      campaignParticipation.isShared = true;
      campaignParticipation.status = SHARED;
      campaignParticipation.participantExternalId = 'Laura';

      // when
      await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

      const updatedCampaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipation.id })
        .first();
      // then
      expect(updatedCampaignParticipation.status).to.equals(SHARED);
      expect(updatedCampaignParticipation.participantExternalId).to.equals('Laura');
    });

    it('should save a snapshot', async function () {
      // given
      campaignParticipation.sharedAt = new Date();

      // when
      await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

      // then
      const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
      expect(snapshotInDB).to.have.length(1);
    });

    context('when there is a transaction', function () {
      it('should save a snapshot using a transaction', async function () {
        campaignParticipation.sharedAt = new Date();

        await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.updateWithSnapshot(campaignParticipation, domainTransaction);
        });

        const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
        expect(snapshotInDB).to.have.length(1);
      });

      it('does not save a snapshot when there is an error', async function () {
        campaignParticipation.sharedAt = new Date();

        try {
          await DomainTransaction.execute(async (domainTransaction) => {
            await campaignParticipationRepository.updateWithSnapshot(campaignParticipation, domainTransaction);
            throw new Error();
          });
          // eslint-disable-next-line no-empty
        } catch (error) {}

        const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
        const participations = await knex.select('sharedAt').from('campaign-participations');
        expect(participations.sharedAt).to.be.undefined;
        expect(snapshotInDB).to.be.empty;
      });
    });
  });

  describe('#isRetrying', function () {
    let campaignId;
    let campaignParticipationId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    context('When the user has just one participation shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has just one participation not shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but all shared', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but not in the same campaign', function () {
      beforeEach(async function () {
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When there is several participations but not for the same user', function () {
      beforeEach(async function () {
        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user is retrying the campaign', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns true', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.true;
      });
    });
  });

  describe('#getAllParticipationsByCampaignId', function () {
    let campaignId;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('returns an empty object when no participations', async function () {
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([]);
    });

    it('returns the list of the campaign', async function () {
      databaseBuilder.factory.buildCampaignParticipation({ masteryRate: 0 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0, validatedSkillsCount: 0 });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });

    it('returns the list of only isImproved=false participations', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        isImproved: false,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        isImproved: true,
      });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });

    it('returns the list of not deleted participations', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        deletedAt: null,
        validatedSkillsCount: 0,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        deletedAt: new Date('2019-03-13'),
      });
      await databaseBuilder.commit();

      const result = await campaignParticipationRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });
  });

  describe('#countParticipationsByStatus', function () {
    describe('For assessment campaign', function () {
      let campaignId;
      let campaignType;

      beforeEach(async function () {
        const campaign = databaseBuilder.factory.buildCampaign();
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function () {
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ started: 0, completed: 0, shared: 0 });
      });

      it("should not count any participation regardless of it's status when participation is deleted ", async function () {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED, deletedAt: '2022-03-17' });
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ started: 0, completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function () {
        it('counts participations shared', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });

        it('counts the last participation shared by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function () {
        it('counts participations completed', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: TO_SHARE });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });

        it('counts the last participations completed by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });
      });

      describe('Count started Participation', function () {
        it('counts participations started', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: STARTED });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });

        it('counts the last participation started by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });
      });
    });

    describe('For profile collection campaign', function () {
      let campaignId;
      let campaignType;

      beforeEach(async function () {
        const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function () {
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ completed: 0, shared: 0 });
      });

      it("should not count any participation regardless of it's status when participation is deleted ", async function () {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, deletedAt: '2022-03-17' });
        await databaseBuilder.commit();

        const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

        expect(result).to.deep.equal({ completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function () {
        it('counts participations shared', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });

        it('counts the last participation shared by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function () {
        it('counts participations completed', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: TO_SHARE });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });

        it('counts the last participation completed by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE });
          await databaseBuilder.commit();

          const result = await campaignParticipationRepository.countParticipationsByStatus(campaignId, campaignType);

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });
      });
    });
  });

  describe('#getAllCampaignParticipationsInCampaignForASameLearner', function () {
    let campaignId;
    let organizationLearnerId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
    });

    context('When the participation is not from the given campaignId', function () {
      it('should return an error 400', async function () {
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const error = await catchErr(async function () {
          await DomainTransaction.execute(async (domainTransaction) => {
            await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
              campaignId,
              campaignParticipationId: campaignParticipationToDelete.id,
              domainTransaction,
            });
          });
        })();
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('When the participant only has participations for the same campaign', function () {
      it('should return all participations for the given campaign', async function () {
        const campaignParticipationImproved = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: true,
        });
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: false,
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations[0]).to.be.instanceOf(CampaignParticipation);
        expect(participations[1]).to.be.instanceOf(CampaignParticipation);
        expect(participations.map((participation) => participation.id)).to.have.members([
          campaignParticipationImproved.id,
          campaignParticipationToDelete.id,
        ]);
      });
    });

    context('When the participant has deleted participations for the same campaigns', function () {
      it('should return only participations which are not deleted', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          deletedBy: userId,
          deletedAt: new Date('2021-06-07'),
        });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations.map((participation) => participation.id)).to.deep.equal([
          campaignParticipationToDelete.id,
        ]);
      });
    });

    context('When the participant has participations for differents campaigns', function () {
      it('should return only participations for the given campaign', async function () {
        const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: otherOrganizationLearnerId,
          campaignId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId: otherCampaignId,
        });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations.map((participation) => participation.id)).to.deep.equal([
          campaignParticipationToDelete.id,
        ]);
      });
    });
  });

  describe('#delete', function () {
    it('should update the campaign-participations with deletedAt and deletedBy attributes', async function () {
      const ownerId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ ownerId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      campaignParticipation.deletedAt = new Date('2022-11-01T23:00:00Z');
      campaignParticipation.deletedBy = ownerId;

      await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.remove({
          id: campaignParticipation.id,
          deletedAt: campaignParticipation.deletedAt,
          deletedBy: campaignParticipation.deletedBy,
          domainTransaction,
        });
      });

      const deletedCampaignParticipation = await knex('campaign-participations').first();

      expect(deletedCampaignParticipation.deletedAt).to.deep.equal(new Date('2022-11-01T23:00:00Z'));
      expect(deletedCampaignParticipation.deletedBy).to.deep.equal(ownerId);
    });
  });
});
