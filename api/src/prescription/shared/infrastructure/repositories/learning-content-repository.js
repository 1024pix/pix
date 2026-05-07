import _ from 'lodash';

import * as learningContentConversionService from '../../../../../lib/domain/services/learning-content/learning-content-conversion-service.js';
import * as frameworksAPI from '../../../../learning-content/application/api/frameworks-api.js';
import * as campaignRepository from '../../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { PIX_ORIGIN } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NoSkillsInCampaignError, NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignLearningContent } from '../../../../shared/domain/models/CampaignLearningContent.js';
import { Framework } from '../../../../shared/domain/models/Framework.js';
import { LearningContent } from '../../../../shared/domain/models/LearningContent.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../../shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';

export const findBySkillIds = async (skillIds, locale) => {
  const skills = await skillRepository.findByRecordIds(skillIds);
  const frameworks = await _getLearningContentBySkills(skills, locale);
  return new CampaignLearningContent(frameworks);
};

export async function findByCampaignParticipationId(campaignParticipationId, locale) {
  const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);
  return await findByCampaignId(campaignId, locale);
}

export async function findByCampaignId(campaignId, locale) {
  const skills = await campaignRepository.findSkills({ campaignId });

  const frameworks = await _getLearningContentBySkills(skills, locale);

  return new CampaignLearningContent(frameworks);
}

export async function findByTargetProfileId(targetProfileId, locale) {
  const knexConn = DomainTransaction.getConnection();

  const cappedTubesDTO = await knexConn('target-profile_tubes')
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

export async function findByOrganizationId({ organizationId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const tubesIdsFromTargetProfile = await knexConn('target-profile-shares')
    .join('target-profile_tubes', 'target-profile_tubes.targetProfileId', '=', 'target-profile-shares.targetProfileId')
    .select({ id: 'tubeId' })
    .where({ organizationId })
    .pluck('tubeId');

  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });
  const pixCompetenceIds = pixCompetences.map(({ id: competenceId }) => competenceId);

  const thematics = await thematicRepository.findByCompetenceIds(pixCompetenceIds, locale);

  const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds).concat(tubesIdsFromTargetProfile);

  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds, locale);

  if (tubes.length === 0) {
    return [];
  }

  const skillIds = tubes.flatMap((tube) => tube.skillIds);

  const skills = await skillRepository.findActiveByRecordIds(skillIds);

  tubes.forEach((tube) => {
    tube.skills = skills?.filter((skill) => tube.skillIds?.includes(skill.id));
  });

  const frameworks = await _getLearningContentByTubes(tubes, locale);

  return frameworks.sort((frameworkA, frameworkB) => {
    if (frameworkA.name === PIX_ORIGIN) return -1;
    if (frameworkB.name === PIX_ORIGIN) return 1;
    return frameworkA.name.localeCompare(frameworkB.name);
  });
}

async function _getLearningContentBySkills(skills, locale) {
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
  const frameworkDtos = await frameworksAPI.findByIds({ ids: frameworkIds });

  return frameworkDtos.map(
    ({ id, name }) =>
      new Framework({
        id,
        name,
        areas: areas.filter((area) => area.frameworkId === id),
      }),
  );
}
