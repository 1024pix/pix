import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { NoSkillsInCampaignError, NotFoundError } from '../../domain/errors.js';
import * as tubeRepository from './tube-repository.js';
import * as thematicRepository from './thematic-repository.js';
import * as campaignRepository from './campaign-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as areaRepository from './area-repository.js';
import * as frameworkRepository from './framework-repository.js';
import * as skillRepository from './skill-repository.js';
import { LearningContent } from '../../domain/models/LearningContent.js';
import * as learningContentConversionService from '../../domain/services/learning-content/learning-content-conversion-service.js';

async function findByCampaignId(campaignId, locale) {
  const skills = await campaignRepository.findSkills({ campaignId });

  const frameworks = await _getLearningContentBySkillIds(skills, locale);

  return new LearningContent(frameworks);
}

async function findByTargetProfileId(targetProfileId, locale) {
  const cappedTubesDTO = await knex('target-profile_tubes')
    .select({
      id: 'tubeId',
      level: 'level',
    })
    .where({ targetProfileId });

  if (cappedTubesDTO.length === 0) {
    throw new NotFoundError("Le profil cible n'existe pas");
  }

  const frameworks = await _getLearningContentByCappedTubes(cappedTubesDTO, locale);
  return new LearningContent(frameworks);
}

async function findByFrameworkNames({ frameworkNames, locale }) {
  const baseFrameworks = [];
  for (const frameworkName of frameworkNames) {
    baseFrameworks.push(await frameworkRepository.getByName(frameworkName));
  }

  const frameworks = await _getLearningContentByFrameworks(baseFrameworks, locale);
  return new LearningContent(frameworks);
}

async function _getLearningContentBySkillIds(skills, locale) {
  if (_.isEmpty(skills)) {
    throw new NoSkillsInCampaignError();
  }
  const tubeIds = _.uniq(skills.map((skill) => skill.tubeId));
  const tubes = await tubeRepository.findByRecordIds(tubeIds, locale);

  tubes.forEach((tube) => {
    tube.skills = skills.filter((skill) => {
      return skill.tubeId === tube.id;
    });
  });

  return _getLearningContentByTubes(tubes, locale);
}

async function _getLearningContentByCappedTubes(cappedTubesDTO, locale) {
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(cappedTubesDTO);

  const tubes = await tubeRepository.findByRecordIds(
    cappedTubesDTO.map((dto) => dto.id),
    locale,
  );

  tubes.forEach((tube) => {
    tube.skills = skills.filter((skill) => {
      return skill.tubeId === tube.id;
    });
  });

  return _getLearningContentByTubes(tubes, locale);
}

async function _getLearningContentByTubes(tubes, locale) {
  const thematicIds = _.uniq(tubes.map((tube) => tube.thematicId));
  const thematics = await thematicRepository.findByRecordIds(thematicIds, locale);
  thematics.forEach((thematic) => {
    thematic.tubes = tubes.filter((tube) => tube.thematicId === thematic.id);
  });

  const competenceIds = _.uniq(tubes.map((tube) => tube.competenceId));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
    competence.thematics = thematics.filter((thematic) => {
      return thematic.competenceId === competence.id;
    });
  });

  const allAreaIds = _.map(competences, (competence) => competence.areaId);
  const uniqAreaIds = _.uniq(allAreaIds, 'id');
  const areas = await areaRepository.findByRecordIds({ areaIds: uniqAreaIds, locale });
  for (const area of areas) {
    area.competences = competences.filter((competence) => {
      return competence.areaId === area.id;
    });
  }

  const frameworkIds = _.uniq(areas.map((area) => area.frameworkId));
  const frameworks = await frameworkRepository.findByRecordIds(frameworkIds);
  for (const framework of frameworks) {
    framework.areas = areas.filter((area) => {
      return area.frameworkId === framework.id;
    });
  }

  return frameworks;
}

async function _getLearningContentByFrameworks(frameworks, locale) {
  for (const framework of frameworks) {
    framework.areas = await areaRepository.findByFrameworkId({ frameworkId: framework.id, locale });
    for (const area of framework.areas) {
      area.competences = await competenceRepository.findByAreaId({ areaId: area.id, locale });
      for (const competence of area.competences) {
        competence.thematics = await thematicRepository.findByCompetenceIds([competence.id], locale);
        for (const thematic of competence.thematics) {
          const tubes = await tubeRepository.findActiveByRecordIds(thematic.tubeIds, locale);
          thematic.tubes = tubes;
          competence.tubes.push(...tubes);
          for (const tube of thematic.tubes) {
            tube.skills = await skillRepository.findActiveByTubeId(tube.id);
          }
        }
      }
    }
  }

  return frameworks;
}

export { findByCampaignId, findByTargetProfileId, findByFrameworkNames };
