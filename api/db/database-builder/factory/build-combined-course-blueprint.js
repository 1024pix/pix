import { databaseBuffer } from '../database-buffer.ts';

const buildCombinedCourseBlueprint = function ({
  id = databaseBuffer.getNextId(),
  name = 'Mon parcours combiné',
  internalName = 'Mon schéma de parcours combiné',
  description = 'Le but de ma quête',
  prescriberDescription = 'Le but de ma quête pour le prescripteur',
  illustration = 'http://example.pix/images/illustration.svg',
  createdAt = new Date(),
  updatedAt,
  questId,
  surveyUrl = null,
  rewardRequirementsDescription = null,
  durationSpan = null,
} = {}) {
  const values = {
    id,
    name,
    internalName,
    description,
    prescriberDescription,
    illustration,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    questId,
    surveyUrl,
    rewardRequirementsDescription,
    durationSpan,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_course_blueprints',
    values,
  });
};

export { buildCombinedCourseBlueprint };
