import iconv from 'iconv-lite';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../../src/quest/domain/models/Quest.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { CsvImportError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Combined course | Domain | UseCases | create-combined-courses', function () {
  it('should create combined course for given payload', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser().id;
    const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: firstOrganizationId,
      targetProfileId: targetProfile.id,
    });
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: secondOrganizationId,
      targetProfileId: targetProfile.id,
    });

    const targetProfileWithTraining = databaseBuilder.factory.buildTargetProfile();
    const trainingId = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      title: 'Demo combinix 1',
      link: '/modules/demo-combinix-1',
      locale: 'fr-fr',
    }).id;

    databaseBuilder.factory.buildTargetProfileTraining({
      targetProfileId: targetProfileWithTraining.id,
      trainingId: trainingId,
    });

    const blueprint1 = databaseBuilder.factory.buildCombinedCourseBlueprint({
      content: [
        { type: 'evaluation', value: targetProfile.id },
        { type: 'module', value: '27d6ca4f' },
        { type: 'module', value: 'df82ec66' },
      ],
    });

    const blueprint2 = databaseBuilder.factory.buildCombinedCourseBlueprint({
      content: [
        { type: 'evaluation', value: targetProfileWithTraining.id },
        { type: 'module', value: '27d6ca4f' },
        { type: 'module', value: 'df82ec66' },
      ],
    });

    await databaseBuilder.commit();
    const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*;Identifiant du schéma de parcours*
${firstOrganizationId},${secondOrganizationId};"{""name"":""Combinix"",""description"":""ma description"", ""illustration"":""mon_illu.svg""}";${userId};${blueprint1.id}
${firstOrganizationId};"{""name"":""Combinix""}";${userId};${blueprint2.id}
`;

    const payload = iconv.encode(input, 'UTF-8');

    // when
    await usecases.createCombinedCourses({ payload });

    const [firstCreatedCampaignForFirstOrganization, secondCreatedCampaignForFirstOrganization] = await knex(
      'campaigns',
    )
      .where({ organizationId: firstOrganizationId })
      .whereIn('targetProfileId', [targetProfile.id, targetProfileWithTraining.id])
      .orderBy('id');
    const createdCampaignForSecondOrganization = await knex('campaigns')
      .where({ targetProfileId: targetProfile.id, organizationId: secondOrganizationId })
      .first();

    const expectedModules = [
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
        comparison: CRITERION_COMPARISONS.ALL,
        data: {
          moduleId: {
            data: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
          isTerminated: {
            data: true,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
        comparison: CRITERION_COMPARISONS.ALL,
        data: {
          moduleId: {
            data: 'f32a2238-4f65-4698-b486-15d51935d335',
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
          isTerminated: {
            data: true,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      },
    ];

    const expectedFirstQuestForFirstOrganization = {
      name: 'Combinix',
      rewardType: null,
      rewardId: null,
      organizationId: firstOrganizationId,
      eligibilityRequirements: [],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: firstCreatedCampaignForFirstOrganization.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
        ...expectedModules,
      ],
      description: 'ma description',
      illustration: 'mon_illu.svg',
    };
    const expectedSecondQuestForFirstOrganization = {
      name: 'Combinix',
      rewardType: null,
      rewardId: null,
      organizationId: firstOrganizationId,
      eligibilityRequirements: [],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: secondCreatedCampaignForFirstOrganization.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
        ...expectedModules,
      ],
    };
    const expectedQuestForSecondOrganization = {
      name: 'Combinix',
      rewardType: null,
      rewardId: null,
      organizationId: secondOrganizationId,
      eligibilityRequirements: [],
      successRequirements: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          comparison: REQUIREMENT_COMPARISONS.ALL,
          data: {
            campaignId: {
              data: createdCampaignForSecondOrganization.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
            status: {
              data: CampaignParticipationStatuses.SHARED,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
        },
        ...expectedModules,
      ],
      description: 'ma description',
      illustration: 'mon_illu.svg',
    };

    // then
    const [firstCreatedQuestForFirstOrganization, secondCreatedQuestForFirstOrganization] = await knex('quests')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', firstOrganizationId)
      .orderBy('quests.id');
    const createdQuestForSecondOrganization = await knex('quests')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', secondOrganizationId)
      .first();

    // 1st Organization
    // Quest
    expect(firstCreatedQuestForFirstOrganization.combinedCourseBlueprintId).to.equal(blueprint1.id);
    expect(firstCreatedQuestForFirstOrganization.code).not.to.be.null;
    expect(firstCreatedQuestForFirstOrganization.name).to.equal(expectedFirstQuestForFirstOrganization.name);
    expect(firstCreatedQuestForFirstOrganization.successRequirements).to.deep.equal(
      expectedFirstQuestForFirstOrganization.successRequirements,
    );
    expect(firstCreatedQuestForFirstOrganization.description).to.equal(
      expectedFirstQuestForFirstOrganization.description,
    );
    expect(firstCreatedQuestForFirstOrganization.illustration).to.equal(
      expectedFirstQuestForFirstOrganization.illustration,
    );
    //Campaign
    expect(firstCreatedCampaignForFirstOrganization.name).to.equal(targetProfile.internalName);
    expect(firstCreatedCampaignForFirstOrganization.title).to.equal(targetProfile.name);
    expect(firstCreatedCampaignForFirstOrganization.customResultPageButtonUrl.includes('/chargement')).false;
    expect(firstCreatedCampaignForFirstOrganization.customResultPageButtonText).to.equal('Continuer');

    // Quest
    expect(secondCreatedQuestForFirstOrganization.combinedCourseBlueprintId).to.equal(blueprint2.id);
    expect(secondCreatedQuestForFirstOrganization.code).not.to.be.null;
    expect(secondCreatedQuestForFirstOrganization.name).to.equal(expectedSecondQuestForFirstOrganization.name);
    expect(secondCreatedQuestForFirstOrganization.successRequirements).to.deep.equal(
      secondCreatedQuestForFirstOrganization.successRequirements,
    );
    // TODO: voir avec Gégé si c'est ok
    // expect(secondCreatedQuestForFirstOrganization.description).null;
    expect(secondCreatedQuestForFirstOrganization.description).to.equal(blueprint2.description);

    // TODO: voir avec Gégé si c'est ok
    // expect(secondCreatedQuestForFirstOrganization.illustration).null;
    expect(secondCreatedQuestForFirstOrganization.illustration).to.equal(blueprint2.illustration);
    //Campaign
    expect(secondCreatedCampaignForFirstOrganization.name).to.equal(targetProfileWithTraining.internalName);
    expect(secondCreatedCampaignForFirstOrganization.title).to.equal(targetProfileWithTraining.name);
    expect(secondCreatedCampaignForFirstOrganization.customResultPageButtonUrl.endsWith('/chargement')).true;
    expect(secondCreatedCampaignForFirstOrganization.customResultPageButtonText).to.equal('Continuer');

    // 2nd Organization
    // Quest
    expect(createdQuestForSecondOrganization.combinedCourseBlueprintId).to.equal(blueprint1.id);
    expect(createdQuestForSecondOrganization.code).not.to.be.null;
    expect(createdQuestForSecondOrganization.name).to.equal(expectedQuestForSecondOrganization.name);
    expect(createdQuestForSecondOrganization.successRequirements).to.deep.equal(
      expectedQuestForSecondOrganization.successRequirements,
    );
    expect(createdQuestForSecondOrganization.description).to.equal(expectedQuestForSecondOrganization.description);
    expect(createdQuestForSecondOrganization.illustration).to.equal(expectedQuestForSecondOrganization.illustration);
    // Campaign
    expect(createdCampaignForSecondOrganization.name).to.equal(targetProfile.internalName);
    expect(createdCampaignForSecondOrganization.title).to.equal(targetProfile.name);
    expect(createdCampaignForSecondOrganization.customResultPageButtonUrl.endsWith('/chargement')).false;
    expect(createdCampaignForSecondOrganization.customResultPageButtonText).to.equal('Continuer');
  });

  it('should not throw encoding error with more than 6 organization ids', async function () {
    // given
    const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*;Identifiant du schéma de parcours*
1,2,3,4,5,6;"{""name"":""Combinix"",""description"":""ma description"", ""illustration"":""mon_illu.svg""}";123;456
`;

    const payload = iconv.encode(input, 'UTF-8');

    // when
    const error = await catchErr(usecases.createCombinedCourses)({ payload });

    // then
    expect(error).not.instanceOf(CsvImportError);
  });
});
