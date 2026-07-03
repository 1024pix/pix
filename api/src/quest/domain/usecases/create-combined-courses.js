import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { COMBINED_COURSE_HEADER } from '../constants.js';
import { Campaign } from '../models/combined-courses/entities/Campaign.js';

export const createCombinedCourses = withTransaction(
  async ({
    payload,
    campaignRepository,
    targetProfileRepository,
    accessCodeGenerator,
    accessCodeRepository,
    combinedCourseRepository,
    combinedCourseBlueprintRepository,
    recommendedModuleRepository,
    moduleRepository,
    questRepository,
  }) => {
    const csvParser = new CsvParser(payload, COMBINED_COURSE_HEADER, { delimiter: ';' });
    const csvData = csvParser.parse();

    const combinedCourses = [];
    const pendingCodes = [];

    for (const row of csvData) {
      const { organizationIds: organizationIdsSeparatedByComma, creatorId, content, combinedCourseBlueprintId } = row;
      const organizationIds = organizationIdsSeparatedByComma.split(',');
      const combinedCourseInformation = JSON.parse(content);
      const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({
        id: combinedCourseBlueprintId,
      });

      for (const organizationId of organizationIds) {
        const combinedCourseCode = await accessCodeGenerator.generateAvailableAccessCode(async (code) => {
          const isCodePending = pendingCodes.includes(code);
          if (isCodePending) return false;
          return accessCodeRepository.isCodeAvailable({ code });
        });
        pendingCodes.push(combinedCourseCode);

        let modules = [];

        if (combinedCourseBlueprint.moduleIds) {
          modules = await moduleRepository.getByIds({
            moduleIds: combinedCourseBlueprint.moduleIds,
          });
        }

        const targetProfileIds = combinedCourseBlueprint.targetProfileIds ?? [];
        const targetProfiles = await targetProfileRepository.findByIds({ ids: targetProfileIds });
        const campaignsToCreate = [];
        const recommendableModules =
          targetProfileIds.length > 0
            ? await recommendedModuleRepository.findIdsByTargetProfileIds({ targetProfileIds })
            : [];

        for (const targetProfile of targetProfiles) {
          const campaignForCombinedCourse = Campaign.buildCampaignForCombinedCourse({
            organizationId,
            targetProfile,
            creatorId,
            combinedCourseCode,
            recommendableModules,
            modules,
          });
          campaignsToCreate.push(campaignForCombinedCourse);
        }

        const createdCampaigns = await campaignRepository.save({
          campaigns: campaignsToCreate,
        });

        const combinedCourse = combinedCourseBlueprint.toCombinedCourse({
          name: combinedCourseInformation.name,
          description: combinedCourseInformation.description,
          illustration: combinedCourseInformation.illustration,
          code: combinedCourseCode,
          organizationId,
          campaigns: createdCampaigns,
        });
        combinedCourses.push(combinedCourse);
      }
    }

    await combinedCourseRepository.saveInBatch({ combinedCourses, questRepository });
  },
);
