import _ from 'lodash';

import * as userRepository from '../../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { createCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/create-campaign.js';
import * as campaignAdministrationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import * as campaignCreatorRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-creator-repository.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES, ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import * as codeGenerator from '../../../../../../src/shared/domain/services/code-generator.js';
import * as accessCodeRepository from '../../../../../../src/shared/infrastructure/repositories/access-code-repository.js';
import { catchErr, databaseBuilder, expect, knex, mockLearningContent } from '../../../../../test-helper.js';

describe('Integration | UseCases | create-campaign', function () {
  let userId;
  let organizationId;
  let targetProfileId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID);

    userId = databaseBuilder.factory.buildUser().id;

    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId,
      targetProfileId,
    });

    databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
    });

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    await mockLearningContent(learningContent);
  });

  it('should save a new campaign of type PROFILES_COLLECTION', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: CampaignTypes.PROFILES_COLLECTION,
      customLandingPageText: 'Hello',
      creatorId: userId,
      ownerId: userId,
      organizationId,
    };

    const expectedAttributes = ['type', 'name', 'customLandingPageText'];

    // when
    const result = await createCampaign({
      campaign,
      userRepository,
      campaignAdministrationRepository,
      campaignCreatorRepository,
      codeGenerator,
      accessCodeRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);
    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
    expect(result.code).to.have.lengthOf.above(0);
  });
  it('should throw an error if creator is not from organization', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    databaseBuilder.factory.buildUser({ id: 14 });
    const owner = databaseBuilder.factory.buildUser({ id: 15 });

    const organization = databaseBuilder.factory.buildOrganization();
    const userOrganization = databaseBuilder.factory.buildOrganization();
    databaseBuilder.factory.buildMembership({
      organizationId: userOrganization.id,
      userId: user.id,
    });

    databaseBuilder.factory.buildMembership({
      organizationId: organization.id,
      userId: owner.id,
    });

    const campaignData = {
      creatorId: 14,
      ownerId: 15,
      organizationId: organization.id,
    };

    await databaseBuilder.commit();
    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignData,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
  });
  it('should throw an error if owner is not from organization', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    const creator = databaseBuilder.factory.buildUser({ id: 14 });
    databaseBuilder.factory.buildUser({ id: 15 });

    const organization = databaseBuilder.factory.buildOrganization();
    const userOrganization = databaseBuilder.factory.buildOrganization();
    databaseBuilder.factory.buildMembership({
      organizationId: userOrganization.id,
      userId: user.id,
    });

    databaseBuilder.factory.buildMembership({
      organizationId: organization.id,
      userId: creator.id,
    });

    const campaignData = {
      creatorId: 14,
      ownerId: 15,
      organizationId: organization.id,
    };

    await databaseBuilder.commit();
    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignData,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
  });

  describe('type ASSESSMENT', function () {
    it('should not save anything if something goes wrong between campaign creation and skills computation', async function () {
      // given
      const learningContent = {
        areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
        competences: [
          {
            id: 'recCompetence1',
            areaId: 'recArea1',
            tubeIds: ['recTube1', 'recTube2', 'recTube3'],
          },
        ],
        tubes: [
          {
            id: 'recTube1',
            skillIds: ['recSkill2'],
          },
        ],
        skills: [
          {
            id: 'recSkill2',
            name: 'recSkill2',
            status: 'actif',
            level: 1,
            tubeId: 'recTube1',
          },
        ],
      };
      await mockLearningContent(learningContent);

      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
      await databaseBuilder.commit();
      const campaignToSave = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId: userId,
        ownerId: userId,
        organizationId,
        multipleSendings: true,
        type: CampaignTypes.ASSESSMENT,
        targetProfileId,
        title: 'Parcours recherche internet',
      };

      // when
      await catchErr(createCampaign)(campaignToSave, {
        userRepository,
        campaignAdministrationRepository,
        campaignCreatorRepository,
        codeGenerator,
        accessCodeRepository,
      });

      // then
      const skillIds = await knex('campaign_skills').pluck('skillId');
      const campaignIds = await knex('campaigns').pluck('id');
      expect(skillIds).to.be.empty;
      expect(campaignIds).to.be.empty;
    });
    it('should save a new campaign of type ASSESSMENT', async function () {
      // given
      const campaign = {
        name: 'a name',
        type: CampaignTypes.ASSESSMENT,
        title: 'a title',
        externalIdLabel: 'id Pix label',
        externalIdType: 'STRING',
        customLandingPageText: 'Hello',
        creatorId: userId,
        ownerId: userId,
        organizationId,
        targetProfileId,
      };

      const expectedAttributes = ['type', 'title', 'externalIdLabel', 'name', 'customLandingPageText'];

      // when
      const result = await createCampaign({
        campaign,
        userRepository,
        campaignAdministrationRepository,
        campaignCreatorRepository,
        codeGenerator,
        accessCodeRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(Campaign);

      expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
    });
  });
  describe('type EXAM', function () {
    it('should not save anything if something goes wrong between campaign creation and skills computation', async function () {
      // given
      const learningContent = {
        areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
        competences: [
          {
            id: 'recCompetence1',
            areaId: 'recArea1',
            tubeIds: ['recTube1', 'recTube2', 'recTube3'],
          },
        ],
        tubes: [
          {
            id: 'recTube1',
            skillIds: ['recSkill3'],
          },
        ],
        skills: [
          {
            id: 'recSkill3',
            name: 'recSkill3',
            status: 'actif',
            level: 1,
            tubeId: 'recTube1',
          },
        ],
      };
      await mockLearningContent(learningContent);

      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
      await databaseBuilder.commit();
      const campaignToSave = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId: userId,
        ownerId: userId,
        organizationId,
        multipleSendings: true,
        type: CampaignTypes.EXAM,
        targetProfileId,
        title: 'Parcours recherche internet',
      };

      // when
      // when
      await catchErr(createCampaign)(campaignToSave, {
        userRepository,
        campaignAdministrationRepository,
        campaignCreatorRepository,
        codeGenerator,
        accessCodeRepository,
      });

      // then
      const skillIds = await knex('campaign_skills').pluck('skillId');
      const campaignIds = await knex('campaigns').pluck('id');
      expect(skillIds).to.be.empty;
      expect(campaignIds).to.be.empty;
    });
    it('should save a new campaign of type EXAM', async function () {
      const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE).id;

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();
      // given
      const campaign = {
        name: 'a name',
        type: CampaignTypes.EXAM,
        title: 'a title',
        externalIdLabel: 'id Pix label',
        externalIdType: 'STRING',
        customLandingPageText: 'Hello',
        creatorId: userId,
        ownerId: userId,
        organizationId,
        targetProfileId,
      };

      const expectedAttributes = ['type', 'title', 'externalIdLabel', 'name', 'customLandingPageText'];

      // when
      const result = await createCampaign({
        campaign,
        userRepository,
        campaignAdministrationRepository,
        campaignCreatorRepository,
        codeGenerator,
        accessCodeRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(Campaign);

      expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
    });
  });
});
