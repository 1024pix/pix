import _ from 'lodash';
import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participation-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation', function () {
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
});
