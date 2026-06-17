import _ from 'lodash';

import * as campaignManagementRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-management-repository.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign-Management', function () {
  describe('#get', function () {
    it('should return campaign details with target profile', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        creatorId: user.id,
        ownerId: owner.id,
        targetProfileId: targetProfile.id,
        organizationId: organization.id,
        isForAbsoluteNovice: true,
      });
      const featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID).id;
      databaseBuilder.factory.buildCampaignFeature({
        featureId,
        campaignId: campaign.id,
        params: { label: 'Id externe', type: CampaignExternalIdTypes.STRING },
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.include({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        externalIdLabel: 'Id externe',
        externalIdType: CampaignExternalIdTypes.STRING,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: targetProfile.id,
        targetProfileName: targetProfile.name,
        title: campaign.title,
        isForAbsoluteNovice: true,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        sharedParticipationsCount: 0,
        totalParticipationsCount: 0,
        multipleSendings: false,
      });
    });

    it('should return campaign details without external id campaign feature', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        creatorId: user.id,
        ownerId: owner.id,
        targetProfileId: targetProfile.id,
        organizationId: organization.id,
        isForAbsoluteNovice: true,
      });

      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.include({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: targetProfile.id,
        targetProfileName: targetProfile.name,
        title: campaign.title,
        isForAbsoluteNovice: true,
        customLandingPageText: campaign.customLandingPageText,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        sharedParticipationsCount: 0,
        totalParticipationsCount: 0,
        multipleSendings: false,
      });
    });

    it('should return campaign details without target profile', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const organization = databaseBuilder.factory.buildOrganization({});
      const campaign = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.PROFILES_COLLECTION,
        creatorId: user.id,
        ownerId: owner.id,
        organizationId: organization.id,
        isForAbsoluteNovice: false,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);

      // then
      expect(result).to.deep.include({
        id: campaign.id,
        name: campaign.name,
        code: campaign.code,
        type: campaign.type,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: null,
        targetProfileName: null,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        isForAbsoluteNovice: false,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        totalParticipationsCount: 0,
        sharedParticipationsCount: 0,
      });
    });

    it('should return campaign details with an empty code if campaign is part of a combined course', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const owner = databaseBuilder.factory.buildUser();
      const organization = databaseBuilder.factory.buildOrganization({});
      const targetProfile = databaseBuilder.factory.buildTargetProfile();

      const campaign = databaseBuilder.factory.buildCampaign({
        creatorId: user.id,
        ownerId: owner.id,
        organizationId: organization.id,
        isForAbsoluteNovice: false,
        code: 'ABCDEF',
        targetProfileId: targetProfile.id,
      });

      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
        ],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId: organization.id,
        questId,
      });

      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.get(campaign.id);
      // then
      expect(result).to.deep.include({
        id: campaign.id,
        name: campaign.name,
        code: '-',
        type: campaign.type,
        createdAt: campaign.createdAt,
        archivedAt: campaign.archivedAt,
        creatorFirstName: user.firstName,
        creatorLastName: user.lastName,
        creatorId: user.id,
        ownerId: owner.id,
        ownerFirstName: owner.firstName,
        ownerLastName: owner.lastName,
        organizationId: organization.id,
        organizationName: organization.name,
        targetProfileId: campaign.targetProfileId,
        targetProfileName: targetProfile.name,
        title: campaign.title,
        customLandingPageText: campaign.customLandingPageText,
        isForAbsoluteNovice: false,
        customResultPageText: null,
        customResultPageButtonText: null,
        customResultPageButtonUrl: null,
        totalParticipationsCount: 0,
        sharedParticipationsCount: 0,
        isPartOfCombinedCourse: true,
      });
    });

    describe('When there are participations', function () {
      context('when campaign type is ASSESSMENT', function () {
        it('should return total and shared participations count', async function () {
          //given
          const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: SHARED,
          });

          await databaseBuilder.commit();
          // when
          const result = await campaignManagementRepository.get(campaign.id);

          expect(result.totalParticipationsCount).to.equal(3);
          expect(result.sharedParticipationsCount).to.equal(1);
        });

        it('should not count neither total nor shared participations for deleted participations', async function () {
          //given
          const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
            deletedAt: new Date(),
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: STARTED,
            deletedAt: new Date(),
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: SHARED,
            deletedAt: new Date(),
          });

          await databaseBuilder.commit();
          // when
          const result = await campaignManagementRepository.get(campaign.id);

          expect(result.totalParticipationsCount).to.equal(0);
          expect(result.sharedParticipationsCount).to.equal(0);
        });
      });

      context('when campaign type is PROFILES_COLLECTION', function () {
        it('should return total and shared participations count', async function () {
          //given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization({});
          const campaign = databaseBuilder.factory.buildCampaign({
            creatorId: userId,
            organizationId: organization.id,
            type: CampaignTypes.PROFILES_COLLECTION,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: SHARED,
          });

          await databaseBuilder.commit();

          // when
          const result = await campaignManagementRepository.get(campaign.id);

          expect(result.totalParticipationsCount).to.equal(1);
          expect(result.sharedParticipationsCount).to.equal(1);
        });

        it('should not count neither total nor shared participations for deleted participations', async function () {
          //given
          const userId = databaseBuilder.factory.buildUser().id;
          const organization = databaseBuilder.factory.buildOrganization({});
          const campaign = databaseBuilder.factory.buildCampaign({
            creatorId: userId,
            organizationId: organization.id,
            type: CampaignTypes.PROFILES_COLLECTION,
          });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            status: SHARED,
            deletedAt: new Date(),
          });

          await databaseBuilder.commit();

          // when
          const result = await campaignManagementRepository.get(campaign.id);

          expect(result.totalParticipationsCount).to.equal(0);
          expect(result.sharedParticipationsCount).to.equal(0);
        });
      });
    });

    context('when the campaign does not exist', function () {
      it('should return null', async function () {
        // when
        const result = await campaignManagementRepository.get(123);

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#findPaginatedCampaignManagements', function () {
    let page;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      await databaseBuilder.commit();

      page = { number: 1, size: 3 };
    });

    context('when the given organization has no campaign', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(campaignManagements).to.be.empty;
      });
    });

    context('when the given organization has campaigns', function () {
      it('should return campaign with all attributes', async function () {
        // given
        const owner = databaseBuilder.factory.buildUser({
          lastName: 'Queen',
          firstName: 'Elizabeth',
        });
        const creator = databaseBuilder.factory.buildUser({
          lastName: 'King',
          firstName: 'Arthur',
        });

        const targetProfile = databaseBuilder.factory.buildTargetProfile({
          name: 'mon profil cible',
        });

        const campaign = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'campaign name',
          code: 'AZERTY789',
          createdAt: new Date('2021-01-01'),
          archivedAt: new Date('2021-01-01'),
          deletedAt: new Date('2021-01-01'),
          type: 'ASSESSMENT',
          creatorId: creator.id,
          ownerId: owner.id,
          targetProfileId: targetProfile.id,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(campaignManagements).to.have.deep.members([
          {
            alternativeTextToExternalIdHelpImage: undefined,
            archivedAt: campaign.archivedAt,
            archivedBy: undefined,
            assessmentMethod: undefined,
            code: 'AZERTY789',
            createdAt: campaign.createdAt,
            creatorFirstName: 'Arthur',
            creatorId: creator.id,
            creatorLastName: 'King',
            customLandingPageText: undefined,
            customResultPageButtonText: undefined,
            customResultPageButtonUrl: undefined,
            customResultPageText: undefined,
            deletedAt: campaign.deletedAt,
            deletedBy: null,
            externalIdHelpImageUrl: undefined,
            externalIdLabel: undefined,
            externalIdType: undefined,
            hasParticipation: false,
            id: campaign.id,
            isForAbsoluteNovice: undefined,
            multipleSendings: undefined,
            name: 'campaign name',
            organizationId: undefined,
            organizationName: undefined,
            ownerFirstName: 'Elizabeth',
            ownerId: owner.id,
            ownerLastName: 'Queen',
            sharedParticipationsCount: undefined,
            targetProfileId: targetProfile.id,
            targetProfileName: 'mon profil cible',
            title: undefined,
            totalParticipationsCount: NaN,
            type: 'ASSESSMENT',
            isPartOfCombinedCourse: false,
            recommendationEngine: false,
          },
        ]);
      });

      it('should sort campaigns by descending creation date', async function () {
        // given
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'May', createdAt: new Date('2020-05-01') });
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'June', createdAt: new Date('2020-06-01') });
        databaseBuilder.factory.buildCampaign({ organizationId, name: 'July', createdAt: new Date('2020-07-01') });
        await databaseBuilder.commit();

        // when
        const { models: campaignManagements } = await campaignManagementRepository.findPaginatedCampaignManagements({
          organizationId,
          page,
        });

        // then
        expect(_.map(campaignManagements, 'name')).to.exactlyContainInOrder(['July', 'June', 'May']);
      });
    });

    context('when campaigns amount exceed page size', function () {
      it('should return page size number of campaigns', async function () {
        page = { number: 2, size: 2 };

        _.times(4, () => databaseBuilder.factory.buildCampaign({ organizationId }));
        const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
        await databaseBuilder.commit();
        // when
        const { models: campaignManagements, meta: pagination } =
          await campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });

        // then
        expect(campaignManagements).to.have.lengthOf(2);
        expect(pagination).to.include(expectedPagination);
      });
    });
  });

  describe('#findActiveCampaignIdsByOrganization', function () {
    it('should return only active campaign IDs for the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const activeCampaign1 = databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: null });
      const activeCampaign2 = databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: null });
      databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: new Date() });
      databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId, deletedAt: null });

      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.findActiveCampaignIdsByOrganization({ organizationId });

      // then
      expect(result).to.have.lengthOf(2);
      expect(result).to.have.members([activeCampaign1.id, activeCampaign2.id]);
    });

    it('should return an empty array when no active campaigns exist', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: new Date() });

      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.findActiveCampaignIdsByOrganization({ organizationId });

      // then
      expect(result).to.be.empty;
    });

    it('should not return campaigns from other organizations', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const activeCampaign = databaseBuilder.factory.buildCampaign({ organizationId, deletedAt: null });
      databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId, deletedAt: null });

      await databaseBuilder.commit();

      // when
      const result = await campaignManagementRepository.findActiveCampaignIdsByOrganization({ organizationId });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result).to.deep.equal([activeCampaign.id]);
    });
  });
});
