const _ = require('lodash');
const { knex } = require('../bookshelf');
const TargetProfileWithLearningContent = require('../../domain/models/TargetProfileWithLearningContent');
const TargetedSkill = require('../../domain/models/TargetedSkill');
const TargetedTube = require('../../domain/models/TargetedTube');
const TargetedCompetence = require('../../domain/models/TargetedCompetence');
const TargetedArea = require('../../domain/models/TargetedArea');
const Badge = require('../../domain/models/Badge');
const BadgeCriterion = require('../../domain/models/BadgeCriterion');
const SkillSet = require('../../domain/models/SkillSet');
const Stage = require('../../domain/models/Stage');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const tubeDatasource = require('../datasources/learning-content/tube-datasource');
const competenceDatasource = require('../datasources/learning-content/competence-datasource');
const areaDatasource = require('../datasources/learning-content/area-datasource');
const { NotFoundError, TargetProfileInvalidError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const { getTranslatedText } = require('../../domain/services/get-translated-text');
const TargetProfileTube = require('../../domain/models/TargetProfileTube');

module.exports = {
  async get({ id, locale = FRENCH_FRANCE }) {
    const whereClauseFnc = (queryBuilder) => {
      return queryBuilder.where('target-profiles.id', id);
    };

    return _get(whereClauseFnc, locale);
  },

  async getByCampaignId({ campaignId, locale = FRENCH_FRANCE }) {
    const whereClauseFnc = (queryBuilder) => {
      return queryBuilder
        .join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id')
        .where('campaigns.id', campaignId);
    };

    return _get(whereClauseFnc, locale);
  },
};

async function _get(whereClauseFnc, locale) {
  const baseQueryBuilder = knex('target-profiles')
    .select(
      'target-profiles.id',
      'target-profiles.name',
      'target-profiles.outdated',
      'target-profiles.isPublic',
      'target-profiles.imageUrl',
      'target-profiles.createdAt',
      'target-profiles.description',
      'target-profiles.comment',
      'target-profiles.ownerOrganizationId',
      'target-profiles.category',
      'target-profiles.isSimplifiedAccess'
    )
    .first();
  const finalQueryBuilder = whereClauseFnc(baseQueryBuilder);
  const result = await finalQueryBuilder;

  if (result == null) {
    throw new NotFoundError("Le profil cible n'existe pas");
  }

  const skills = await knex('target-profiles_skills').select('skillId').where('targetProfileId', result.id);
  const tubes = await knex('target-profile_tubes').select('tubeId', 'level').where('targetProfileId', result.id);

  const badges = await _findBadges(result.id);
  const stages = await _findStages(result.id);

  return _toDomain({
    targetProfile: result,
    targetProfileTubes: tubes,
    targetProfileSkills: skills,
    badges,
    stages,
    locale,
  });
}

async function _toDomain({ targetProfile, targetProfileTubes, targetProfileSkills, badges, stages, locale }) {
  const skillIds = targetProfileSkills.map(({ skillId }) => skillId);
  const { skills, tubes, competences, areas } = await _getTargetedLearningContent(skillIds, locale);

  const tubesSelection = targetProfileTubes.map(
    (tube) =>
      new TargetProfileTube({
        id: tube.tubeId,
        level: tube.level,
      })
  );

  return new TargetProfileWithLearningContent({
    id: targetProfile.id,
    name: targetProfile.name,
    outdated: targetProfile.outdated,
    isPublic: targetProfile.isPublic,
    createdAt: targetProfile.createdAt,
    ownerOrganizationId: targetProfile.ownerOrganizationId,
    imageUrl: targetProfile.imageUrl,
    description: targetProfile.description,
    comment: targetProfile.comment,
    category: targetProfile.category,
    isSimplifiedAccess: targetProfile.isSimplifiedAccess,
    tubesSelection,
    skills,
    tubes,
    competences,
    areas,
    badges,
    stages,
  });
}

async function _getTargetedLearningContent(skillIds, locale) {
  const skills = await _findTargetedSkills(skillIds);
  if (_.isEmpty(skills)) {
    throw new TargetProfileInvalidError();
  }
  const tubes = await _findTargetedTubes(skills, locale);
  const competences = await _findTargetedCompetences(tubes, locale);
  const areas = await _findTargetedAreas(competences, locale);

  return {
    skills,
    tubes,
    competences,
    areas,
  };
}

async function _findTargetedSkills(skillIds) {
  const learningContentSkills = await skillDatasource.findOperativeByRecordIds(skillIds);
  return learningContentSkills.map((learningContentSkill) => {
    return new TargetedSkill(learningContentSkill);
  });
}

async function _findTargetedTubes(skills, locale) {
  const skillsByTubeId = _.groupBy(skills, 'tubeId');
  const learningContentTubes = await tubeDatasource.findByRecordIds(Object.keys(skillsByTubeId));
  return learningContentTubes.map((learningContentTube) => {
    const practicalTitle = getTranslatedText(locale, {
      frenchText: learningContentTube.practicalTitleFrFr,
      englishText: learningContentTube.practicalTitleEnUs,
    });
    const description = getTranslatedText(locale, {
      frenchText: learningContentTube.practicalDescriptionFrFr,
      englishText: learningContentTube.practicalDescriptionEnUs,
    });
    return new TargetedTube({
      ...learningContentTube,
      practicalTitle,
      description,
      skills: skillsByTubeId[learningContentTube.id],
    });
  });
}

async function _findTargetedCompetences(tubes, locale) {
  const tubesByCompetenceId = _.groupBy(tubes, 'competenceId');
  const learningContentCompetences = await competenceDatasource.findByRecordIds(Object.keys(tubesByCompetenceId));
  return learningContentCompetences.map((learningContentCompetence) => {
    const name = getTranslatedText(locale, {
      frenchText: learningContentCompetence.nameFrFr,
      englishText: learningContentCompetence.nameEnUs,
    });
    return new TargetedCompetence({
      ...learningContentCompetence,
      name,
      tubes: tubesByCompetenceId[learningContentCompetence.id],
    });
  });
}

async function _findTargetedAreas(competences, locale) {
  const competencesByAreaId = _.groupBy(competences, 'areaId');
  const learningContentAreas = await areaDatasource.findByRecordIds(Object.keys(competencesByAreaId));
  return learningContentAreas.map((learningContentArea) => {
    const title = getTranslatedText(locale, {
      frenchText: learningContentArea.titleFrFr,
      englishText: learningContentArea.titleEnUs,
    });
    return new TargetedArea({
      ...learningContentArea,
      title,
      competences: competencesByAreaId[learningContentArea.id],
    });
  });
}

async function _findStages(targetProfileId) {
  const stageRows = await knex('stages')
    .select(
      'stages.id',
      'stages.threshold',
      'stages.message',
      'stages.title',
      'stages.prescriberTitle',
      'stages.prescriberDescription'
    )
    .where('stages.targetProfileId', targetProfileId);

  if (_.isEmpty(stageRows)) {
    return [];
  }

  return stageRows.map((row) => new Stage(row));
}

async function _findBadges(targetProfileId) {
  const badgeRows = await knex('badges')
    .select(
      'badges.id',
      'badges.key',
      'badges.message',
      'badges.altMessage',
      'badges.isCertifiable',
      'badges.title',
      'badges.targetProfileId'
    )
    .where('badges.targetProfileId', targetProfileId);

  if (_.isEmpty(badgeRows)) {
    return [];
  }

  const badges = badgeRows.map((row) => new Badge({ ...row, imageUrl: null }));
  await _fillBadgesWithCriteria(badges);
  await _fillBadgesWithSkillSets(badges);

  return badges;
}

async function _fillBadgesWithCriteria(badges) {
  const badgeIds = badges.map((badge) => badge.id);
  const criteriaRows = await knex('badge-criteria')
    .select(
      'badge-criteria.id',
      'badge-criteria.scope',
      'badge-criteria.threshold',
      'badge-criteria.badgeId',
      'badge-criteria.skillSetIds'
    )
    .whereIn('badge-criteria.badgeId', badgeIds);

  const criteriaRowsByBadgeId = _.groupBy(criteriaRows, 'badgeId');

  badges.forEach((badge) => {
    const criteriaRowsForBadge = criteriaRowsByBadgeId[badge.id];
    badge.badgeCriteria = _.map(criteriaRowsForBadge, (criteriaRow) => new BadgeCriterion(criteriaRow));
  });
}

async function _fillBadgesWithSkillSets(badges) {
  const badgeIds = badges.map((badge) => badge.id);
  const skillSetRows = await knex('skill-sets')
    .select('skill-sets.id', 'skill-sets.name', 'skill-sets.skillIds', 'skill-sets.badgeId')
    .whereIn('skill-sets.badgeId', badgeIds);

  const skillSetRowsByBadgeId = _.groupBy(skillSetRows, 'badgeId');

  badges.forEach((badge) => {
    const skillSetRowsForBadge = skillSetRowsByBadgeId[badge.id];
    badge.skillSets = _.map(skillSetRowsForBadge, (skillSetRow) => new SkillSet(skillSetRow));
  });
}
