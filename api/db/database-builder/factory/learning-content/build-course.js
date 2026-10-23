import { databaseBuffer } from '../../database-buffer.ts';

export function buildCourse({
  id = 'courseIdA',
  name = 'instruction Test Statique A',
  description = 'description Test Statique A',
  isActive = true,
  competences = [],
  challenges = [],
} = {}) {
  return buildCourseInDB({ id, name, description, isActive, competences, challenges });
}

export function buildCourseWithNoDefaultValues({ id, name, description, isActive, competences, challenges }) {
  return buildCourseInDB({ id, name, description, isActive, competences, challenges });
}

function buildCourseInDB({ id, name, description, isActive, competences, challenges }) {
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
