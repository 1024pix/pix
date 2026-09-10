import { PRO_ORGANIZATION_ID } from '../common/constants.js';

const NAME = 'POC parcours de parcours';
const DESCRIPTION =
  '# POC\nUn parcours combiné composé de parcours combinés. Chaque étape est elle-même un parcours complet.';

/**
 * POC: a combined course whose items are combined courses.
 * The children must belong to the same organization, otherwise their participations
 * (indexed by organizationLearnerId) would never be found.
 */
export const buildNestedCombinedCourse = (databaseBuilder, childCombinedCourseIds) => {
  const { buildQuestForCombinedCourse, buildCombinedCourse, buildCombinedCourseBlueprint } = databaseBuilder.factory;

  const successRequirements = childCombinedCourseIds.map((combinedCourseId) => ({
    requirement_type: 'combinedCourses',
    comparison: 'all',
    data: {
      combinedCourseId: { data: combinedCourseId, comparison: 'equal' },
      status: { data: 'COMPLETED', comparison: 'equal' },
    },
  }));

  const { id: blueprintQuestId } = buildQuestForCombinedCourse({ successRequirements });
  const { id: combinedCourseBlueprintId } = buildCombinedCourseBlueprint({
    name: NAME,
    internalName: NAME,
    description: DESCRIPTION,
    questId: blueprintQuestId,
  });

  const { id: questId } = buildQuestForCombinedCourse({ successRequirements });

  buildCombinedCourse({
    code: 'METACOMB',
    name: NAME,
    organizationId: PRO_ORGANIZATION_ID,
    combinedCourseBlueprintId,
    questId,
    description: DESCRIPTION,
  });
};
