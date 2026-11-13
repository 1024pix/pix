import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../../shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { VersionDetails } from '../../domain/read-models/VersionDetails.js';

export async function getById(id) {
  const knexConn = DomainTransaction.getConnection();
  const versionData = await knexConn
    .select({
      id: 'certification_versions.id',
      scope: 'certification_versions.scope',
      startDate: 'certification_versions.startDate',
      expirationDate: 'certification_versions.expirationDate',
      assessmentDuration: 'certification_versions.assessmentDuration',
      minimumAnswersRequiredForValidation: 'certification_versions.minimumAnswersRequiredToValidateACertification',
      maximumAssessmentLength: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'maximumAssessmentLength\'',
      ),
      challengesBetweenSameCompetence: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'challengesBetweenSameCompetence\'',
      ),
      defaultProbabilityToPickChallenge: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'defaultProbabilityToPickChallenge\'',
      ),
      defaultCandidateCapacity: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'defaultCandidateCapacity\'',
      ),
      variationPercent: knexConn.raw('certification_versions."challengesConfiguration"->\'variationPercent\''),
      limitToOneQuestionPerTube: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'limitToOneQuestionPerTube\'',
      ),
      enablePassageByAllCompetences: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'enablePassageByAllCompetences\'',
      ),
      status: 'certification_versions.status',
      comments: 'certification_versions.comments',
      globalScoringConfiguration: 'certification_versions.globalScoringConfiguration',
      externalCalibrationId: 'certification_versions.externalCalibrationId',
      tubeIds: knexConn.raw(`array_agg(certification_versions_tubes.tube_id)`),
    })
    .from('certification_versions')
    .join('certification_versions_tubes', 'certification_versions_tubes.version_id', 'certification_versions.id')
    .groupBy('certification_versions.id')
    .where('certification_versions.id', id)
    .first();

  if (!versionData) {
    return null;
  }
  let tubes = await tubeRepository.findByRecordIds(versionData.tubeIds, FRENCH_SPOKEN);
  tubes = tubes.map((tube) => ({
    id: tube.id,
    thematicId: tube.thematicId,
    skillIds: tube.skillIds,
    competenceId: tube.competenceId,
    name: tube.name,
    practicalTitle: tube.practicalTitle,
    mobile: tube.isMobileCompliant,
    tablet: tube.isTabletCompliant,
  }));

  const skillIds = tubes.flatMap((tube) => tube.skillIds ?? []);
  const uniqSkillIds = [...new Set(skillIds)];
  let skills = await skillRepository.findByRecordIds(uniqSkillIds);
  skills = skills.map((skill) => ({
    id: skill.id,
    tubeId: skill.tubeId,
    difficulty: skill.difficulty,
  }));
  const skillsByTubeId = Map.groupBy(skills, (skill) => skill.tubeId);
  tubes.forEach((tube) => {
    tube.skills = skillsByTubeId.get(tube.id) ?? [];
  });

  const thematicIds = tubes.map((tube) => tube.thematicId);
  let thematics = await thematicRepository.findByRecordIds(thematicIds, FRENCH_SPOKEN);
  thematics = thematics.map((thematic) => ({
    id: thematic.id,
    competenceId: thematic.competenceId,
    name: thematic.name,
    index: thematic.index,
  }));
  const tubesByThematicId = Map.groupBy(tubes, (tube) => tube.thematicId);
  thematics.forEach((thematic) => {
    thematic.tubes = tubesByThematicId.get(thematic.id) ?? [];
  });

  const competenceIds = tubes.map((tube) => tube.competenceId);
  let competences = await competenceRepository.findByRecordIds({
    competenceIds,
    locale: FRENCH_SPOKEN,
  });
  competences = competences.map((competence) => ({
    id: competence.id,
    areaId: competence.areaId,
    name: competence.name,
    index: competence.index,
  }));
  const thematicsByCompetenceId = Map.groupBy(thematics, (thematic) => thematic.competenceId);
  competences.forEach((competence) => {
    competence.thematics = thematicsByCompetenceId.get(competence.id) ?? [];
  });

  const allAreaIds = competences.map((competence) => competence.areaId);
  const uniqAreaIds = [...new Set(allAreaIds)];
  let areas = await areaRepository.findByRecordIds({
    areaIds: uniqAreaIds,
    locale: FRENCH_SPOKEN,
  });
  areas = areas.map((area) => ({
    id: area.id,
    frameworkId: area.frameworkId,
    color: area.color,
    code: area.code,
    title: area.title,
  }));
  const competencesByAreaId = Map.groupBy(competences, (competence) => competence.areaId);
  areas.forEach((area) => {
    area.competences = competencesByAreaId.get(area.id) ?? [];
  });

  competences.forEach((competence) => {
    delete competence.areaId;
  });
  thematics.forEach((thematic) => {
    delete thematic.competenceId;
  });
  tubes.forEach((tube) => {
    delete tube.thematicId;
    delete tube.competenceId;
    delete tube.skillIds;
  });
  skills.forEach((skill) => {
    delete skill.tubeId;
  });

  return new VersionDetails({
    ...versionData,
    areas,
  });
}
