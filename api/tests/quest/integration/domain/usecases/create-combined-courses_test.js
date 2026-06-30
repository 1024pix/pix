import iconv from 'iconv-lite';

import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { CsvImportError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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

    const expectedModules = [
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({
        moduleId: '5df14039-803b-4db4-9778-67e4b84afbbd',
      }).toDTO(),
      CombinedCourseBlueprint.buildRequirementForCombinedCourse({
        moduleId: 'f32a2238-4f65-4698-b486-15d51935d335',
      }).toDTO(),
    ];

    const blueprintQuest1Id = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: targetProfile.id }).toDTO(),
        ...expectedModules,
      ],
    }).id;
    const blueprintQuest2Id = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId: targetProfileWithTraining.id,
        }).toDTO(),
        ...expectedModules,
      ],
    }).id;

    const blueprint1 = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: blueprintQuest1Id });
    const blueprint2 = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId: blueprintQuest2Id });

    await databaseBuilder.commit();
    const input = `Identifiant des organisations*;Json configuration for quest*;Identifiant du createur des campagnes*;Identifiant du schéma de parcours*
${firstOrganizationId},${secondOrganizationId};"{""name"":""Combinix"",""description"":""ma description"", ""illustration"":""mon_illu.svg""}";${userId};${blueprint1.id}
${firstOrganizationId};"{""name"":""Combinix""}";${userId};${blueprint2.id}
`;

    const payload = iconv.encode(input, 'UTF-8');

    // when
    await usecases.createCombinedCourses({ payload });

    // then
    const [firstQuestOrga1, secondQuestOrga1] = await knex('quests')
      .select('quests.id', 'quests.successRequirements')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', firstOrganizationId)
      .orderBy('quests.id');

    const firstCombinedCourseOrga1 = await knex('combined_courses').where('questId', firstQuestOrga1.id).first();
    const firstCombinedCourseOrga1Campaign = await knex('campaigns')
      .where('id', firstQuestOrga1.successRequirements[0].data.campaignId.data)
      .first();

    const secondCombinedCourseOrga1 = await knex('combined_courses').where('questId', secondQuestOrga1.id).first();
    const secondCombinedCourseOrga1Campaign = await knex('campaigns')
      .where('id', secondQuestOrga1.successRequirements[0].data.campaignId.data)
      .first();

    const questOrga2 = await knex('quests')
      .select('quests.id', 'quests.successRequirements')
      .join('combined_courses', 'combined_courses.questId', 'quests.id')
      .where('combined_courses.organizationId', secondOrganizationId)
      .first();
    const combinedCourseOrga2 = await knex('combined_courses').where('questId', questOrga2.id).first();
    const combinedCourseOrga2Campaign = await knex('campaigns')
      .where('id', questOrga2.successRequirements[0].data.campaignId.data)
      .first();

    // 1st Organization
    expect(firstCombinedCourseOrga1.code).not.to.be.null;
    expect(firstCombinedCourseOrga1.combinedCourseBlueprintId).to.equal(blueprint1.id);
    expect(firstQuestOrga1.successRequirements.length).to.equal(3);
    expect(firstCombinedCourseOrga1Campaign.targetProfileId).to.equal(targetProfile.id);

    expect(secondCombinedCourseOrga1.code).not.to.be.null;
    expect(secondCombinedCourseOrga1.combinedCourseBlueprintId).to.equal(blueprint2.id);
    expect(secondQuestOrga1.successRequirements.length).to.equal(3);
    expect(secondCombinedCourseOrga1Campaign.targetProfileId).to.equal(targetProfileWithTraining.id);

    // 2nd Organization
    expect(combinedCourseOrga2.code).not.to.be.null;
    expect(combinedCourseOrga2.combinedCourseBlueprintId).to.equal(blueprint1.id);
    expect(questOrga2.successRequirements.length).to.equal(3);
    expect(combinedCourseOrga2Campaign.targetProfileId).to.equal(targetProfile.id);
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
