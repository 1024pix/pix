import * as targetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as tubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';
import { COURSE_ITEM_TYPES, CourseItem } from '../../domain/models/combined-courses/value-objects/CourseItem.js';
import * as combinedCourseBlueprintRepository from './combined-course-blueprints/combined-course-blueprint-repository.js';

export const findByOrganizationId = async ({ organizationId, locale }) => {
  const [blueprints, sharedTargetProfiles] = await Promise.all([
    combinedCourseBlueprintRepository.findByOrganizationId({ organizationId }),
    targetProfileRepository.findSharedByOrganizationId(organizationId),
  ]);

  const allTargetProfileIds = [
    ...new Set([
      ...blueprints.flatMap((blueprint) => blueprint.targetProfileIds),
      ...sharedTargetProfiles.map((tp) => tp.id),
    ]),
  ];

  const tubeRows =
    allTargetProfileIds.length > 0
      ? await targetProfileRepository.findTubeIdsByTargetProfileIds(allTargetProfileIds)
      : [];

  const tubeIdsByTargetProfileId = groupTubeIdsByTargetProfileId(tubeRows);

  const blueprintRows = blueprints.map((blueprint) => buildBlueprintRow(blueprint, tubeIdsByTargetProfileId));
  const targetProfileRows = sharedTargetProfiles.map((tp) => buildTargetProfileRow(tp, tubeIdsByTargetProfileId));

  const blueprintRowsById = new Map(blueprintRows.map((row) => [row.id, row]));
  const targetProfileRowsById = new Map(targetProfileRows.map((row) => [row.id, row]));

  const allRows = new Map([...blueprintRowsById, ...targetProfileRowsById]);
  const { areasByCompetenceId, competencesByTubeId } = await resolveLearningContent(allRows, locale);

  const toItem = (type) => (row) => {
    const areas = resolveAreas(row, competencesByTubeId, areasByCompetenceId);
    return new CourseItem({
      id: row.id,
      name: row.name,
      type,
      nbTubes: row.nbTubes,
      nbModules: row.nbModules,
      category: row.category,
      isSimplifiedAccess: row.isSimplifiedAccess,
      areas,
      createdAt: row.createdAt,
    });
  };

  const blueprintItems = [...blueprintRowsById.values()].map(toItem(COURSE_ITEM_TYPES.BLUEPRINT));
  const targetProfileItems = [...targetProfileRowsById.values()].map(toItem(COURSE_ITEM_TYPES.TARGET_PROFILE));

  return [...blueprintItems, ...targetProfileItems].sort(compareByNameThenByDate);
};

const compareByNameThenByDate = (a, b) => {
  const nameComparison = a.name.localeCompare(b.name);
  if (nameComparison !== 0) return nameComparison;
  return new Date(b.createdAt) - new Date(a.createdAt);
};

const groupTubeIdsByTargetProfileId = (tubeRows) => {
  const map = new Map();
  for (const { targetProfileId, tubeId } of tubeRows) {
    if (!map.has(targetProfileId)) map.set(targetProfileId, []);
    map.get(targetProfileId).push(tubeId);
  }
  return map;
};

const buildBlueprintRow = (blueprint, tubeIdsByTargetProfileId) => {
  const uniqueTubeIds = [
    ...new Set(blueprint.targetProfileIds.flatMap((id) => tubeIdsByTargetProfileId.get(id) ?? [])),
  ];
  return {
    id: blueprint.id,
    name: blueprint.name,
    createdAt: blueprint.createdAt,
    nbTubes: uniqueTubeIds.length,
    nbModules: blueprint.moduleIds.length,
    tubeIds: uniqueTubeIds,
    category: null,
    isSimplifiedAccess: null,
  };
};

const buildTargetProfileRow = (targetProfile, tubeIdsByTargetProfileId) => {
  const tubeIds = tubeIdsByTargetProfileId.get(targetProfile.id) ?? [];
  return {
    id: targetProfile.id,
    name: targetProfile.name,
    createdAt: targetProfile.createdAt,
    nbTubes: tubeIds.length,
    nbModules: null,
    tubeIds,
    category: targetProfile.category,
    isSimplifiedAccess: targetProfile.isSimplifiedAccess,
  };
};

const resolveLearningContent = async (rowsById, locale) => {
  const allTubeIds = [...new Set([...rowsById.values()].flatMap((row) => row.tubeIds))];

  if (allTubeIds.length === 0) {
    return { areasByCompetenceId: new Map(), competencesByTubeId: new Map() };
  }

  const tubes = await tubeRepository.findByRecordIds(allTubeIds, locale);

  const uniqueCompetenceIds = [...new Set(tubes.map((tube) => tube.competenceId))];
  const competences = await competenceRepository.findByRecordIds({ competenceIds: uniqueCompetenceIds, locale });

  const uniqueAreaIds = [...new Set(competences.map((competence) => competence.areaId))];
  const areas = await areaRepository.findByRecordIds({ areaIds: uniqueAreaIds, locale });

  const competencesByTubeId = new Map(
    tubes.map((tube) => [tube.id, competences.find((competence) => competence.id === tube.competenceId)]),
  );

  const areasByCompetenceId = new Map(
    competences.map((competence) => [competence.id, areas.find((area) => area.id === competence.areaId)]),
  );

  return { areasByCompetenceId, competencesByTubeId };
};

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const resolveAreas = (row, competencesByTubeId, areasByCompetenceId) => {
  const uniqueCompetences = uniqueById(row.tubeIds.map((tubeId) => competencesByTubeId.get(tubeId)));

  const areasMap = new Map();
  for (const competence of uniqueCompetences) {
    const area = areasByCompetenceId.get(competence.id);
    if (!areasMap.has(area.id)) {
      areasMap.set(area.id, { id: area.id, code: area.code, title: area.title, color: area.color, competences: [] });
    }
    areasMap.get(area.id).competences.push({ id: competence.id, name: competence.name, index: competence.index });
  }

  return [...areasMap.values()]
    .sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '', undefined, { numeric: true }))
    .map((area) => ({
      ...area,
      competences: area.competences.sort((a, b) =>
        (a.index ?? '').localeCompare(b.index ?? '', undefined, { numeric: true }),
      ),
    }));
};
