import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import * as campaignRepository from '../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { NoSkillsInCampaignError, NotFoundError } from '../../../src/shared/domain/errors.js';
import { CampaignLearningContent } from '../../../src/shared/domain/models/CampaignLearningContent.js';
import { LearningContent } from '../../../src/shared/domain/models/LearningContent.js';
import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../src/shared/infrastructure/repositories/tube-repository.js';
import * as learningContentConversionService from '../../domain/services/learning-content/learning-content-conversion-service.js';

async function findByCampaignId({ campaignId, locale, frameworksApi }) {
  const skills = await campaignRepository.findSkills({ campaignId });

  const frameworks = await _getLearningContentBySkillIds(skills, locale, frameworksApi);

  return new CampaignLearningContent(frameworks);
}

async function findByTargetProfileId({ targetProfileId, locale, frameworksApi }) {
  const cappedTubesDTO = await knex('target-profile_tubes')
    .select({
      id: 'tubeId',
      level: 'level',
    })
    .where({ targetProfileId });

  if (cappedTubesDTO.length === 0) {
    throw new NotFoundError("Le profil cible n'existe pas");
  }

  const frameworks = await _getLearningContentByCappedTubes(cappedTubesDTO, locale, frameworksApi);
  return new LearningContent(frameworks);
}

async function findByFrameworkNames({ frameworkNames, locale, frameworksApi }) {
  const baseFrameworkDTOs = await frameworksApi.findByNames({ names: frameworkNames });

  const frameworks = await _getLearningContentByFrameworks(structuredClone(baseFrameworkDTOs), locale);
  return new LearningContent(frameworks);
}

async function _getLearningContentBySkillIds(skills, locale, frameworksApi) {
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

  return _getLearningContentByTubes(tubes, locale, frameworksApi);
}

async function _getLearningContentByCappedTubes(cappedTubesDTO, locale, frameworksApi) {
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

  return _getLearningContentByTubes(tubes, locale, frameworksApi);
}

async function _getLearningContentByTubes(tubes, locale, frameworksApi) {
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
  const frameworkDTOs = await frameworksApi.findByIds({ ids: frameworkIds });
  const clonedFrameworkDTOs = structuredClone(frameworkDTOs);
  for (const framework of clonedFrameworkDTOs) {
    framework.areas = areas.filter((area) => {
      return area.frameworkId === framework.id;
    });
  }

  return clonedFrameworkDTOs;
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

export { findByCampaignId, findByFrameworkNames, findByTargetProfileId };
