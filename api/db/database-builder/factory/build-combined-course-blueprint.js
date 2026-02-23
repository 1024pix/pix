import { databaseBuffer } from '../database-buffer.js';

const buildCombinedCourseBlueprint = function ({
  id = databaseBuffer.getNextId(),
  name = 'Mon parcours combiné',
  internalName = 'Mon schéma de parcours combiné',
  description = 'Le but de ma quête',
  illustration = 'images/illustration.svg',
  createdAt = new Date(),
  updatedAt,
  content = [],
  questId,
} = {}) {
  const values = {
    id,
    name,
    internalName,
    description,
    illustration,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    content: JSON.stringify(content),
    questId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_course_blueprints',
    values,
  });
};

export { buildCombinedCourseBlueprint };
