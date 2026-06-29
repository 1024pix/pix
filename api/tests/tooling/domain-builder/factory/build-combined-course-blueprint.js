import { CombinedCourseBlueprint } from '../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';

function buildCombinedCourseBlueprint({
  id = 1,
  name = 'Mon parcours',
  internalName = 'Mon modèle de parcours',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  illustration = '/illustrations/image.svg',
  createdAt = new Date(),
  updatedAt = new Date(),
  organizationIds = [],
  quest,
  surveyUrl = null,
  rewardRequirementsDescription = null,
} = {}) {
  return new CombinedCourseBlueprint({
    id,
    name,
    internalName,
    description,
    illustration,
    createdAt,
    updatedAt,
    organizationIds,
    quest,
    surveyLink: surveyUrl,
    rewardRequirements: rewardRequirementsDescription,
  });
}

export { buildCombinedCourseBlueprint };
