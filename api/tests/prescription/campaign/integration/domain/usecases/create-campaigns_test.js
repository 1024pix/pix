import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignExternalIdTypes, CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES, ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | UseCases | create-campaigns', function () {
  it('should create combined course for given payload', async function () {
    // given
    const creatorUserId = databaseBuilder.factory.buildUser().id;
    const firstUserId = databaseBuilder.factory.buildUser().id;
    const secondUserId = databaseBuilder.factory.buildUser().id;
    const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;

    databaseBuilder.factory.buildMembership({
      userId: firstUserId,
      organizationId: firstOrganizationId,
    });
    databaseBuilder.factory.buildMembership({
      userId: secondUserId,
      organizationId: secondOrganizationId,
    });

    const firstTargetProfile = databaseBuilder.factory.buildTargetProfile();

    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: firstOrganizationId,
      targetProfileId: firstTargetProfile.id,
    });

    const secondTargetProfile = databaseBuilder.factory.buildTargetProfile();

    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: secondOrganizationId,
      targetProfileId: secondTargetProfile.id,
    });

    databaseBuilder.factory.buildFeature({
      key: CAMPAIGN_FEATURES.EXTERNAL_ID.key,
    });

    const featureExam = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
    });

    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: firstOrganizationId,
      featureId: featureExam.id,
    });

    const multipleSendingsFeature = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
    });

    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: secondOrganizationId,
      featureId: multipleSendingsFeature.id,
    });

    await databaseBuilder.commit();

    const campaignsToCreate = [
      {
        organizationId: firstOrganizationId,
        ownerId: firstUserId,
        name: 'Nom de ma campagne 1',
        title: 'Mon titre de parcours 1',
        customLandingPageText: 'ma description 1',
        type: CampaignTypes.EXAM,
        targetProfileId: firstTargetProfile.id,
        creatorId: creatorUserId,
        externalIdLabel: 'Email',
        externalIdType: CampaignExternalIdTypes.EMAIL,
        multipleSendings: false,
      },
      {
        organizationId: secondOrganizationId,
        ownerId: secondUserId,
        name: 'Nom de ma campagne 2',
        title: 'Mon titre de parcours 2',
        customLandingPageText: 'ma description 2',
        type: CampaignTypes.ASSESSMENT,
        targetProfileId: secondTargetProfile.id,
        creatorId: creatorUserId,
        multipleSendings: true,
        customResultPageText: 'oui',
        customResultPageButtonText: 'non',
        customResultPageButtonUrl: 'https://my-url.io',
      },
    ];

    // when
    await usecases.createCampaigns({ campaignsToCreate });

    // then
    const examCampaign = await knex('campaigns').where({ type: CampaignTypes.EXAM }).first();

    expect(examCampaign).deep.include({
      name: 'Nom de ma campagne 1',
      title: 'Mon titre de parcours 1',
      customLandingPageText: 'ma description 1',
      type: CampaignTypes.EXAM,
      multipleSendings: false,
      isForAbsoluteNovice: false,
      creatorId: creatorUserId,
      organizationId: firstOrganizationId,
      targetProfileId: firstTargetProfile.id,
    });

    const assessmentCampaign = await knex('campaigns').where({ type: CampaignTypes.ASSESSMENT }).first();

    expect(assessmentCampaign).deep.include({
      name: 'Nom de ma campagne 2',
      title: 'Mon titre de parcours 2',
      customLandingPageText: 'ma description 2',
      type: CampaignTypes.ASSESSMENT,
      multipleSendings: true,
      isForAbsoluteNovice: false,
      creatorId: creatorUserId,
      organizationId: secondOrganizationId,
      targetProfileId: secondTargetProfile.id,
      customResultPageButtonText: 'non',
      customResultPageButtonUrl: 'https://my-url.io',
      customResultPageText: 'oui',
    });
  });
});
