import { databaseBuffer } from '../../database-buffer.js';

export function buildCourse({
  id = 'courseIdA',
  name = 'instruction Test Statique A',
  description = 'description Test Statique A',
  isActive = true,
  competences = [],
  challenges = [],
} = {}) {
  const values = {
    id,
    name,
    description,
    isActive,
    competences,
    challenges,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.courses',
    values,
  });
}
