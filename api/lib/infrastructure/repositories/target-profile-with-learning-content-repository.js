const _ = require('lodash');
const { knex } = require('../bookshelf');
const TargetProfileWithLearningContent = require('../../domain/models/TargetProfileWithLearningContent');
const TargetedSkill = require('../../domain/models/TargetedSkill');
const TargetedTube = require('../../domain/models/TargetedTube');
const TargetedCompetence = require('../../domain/models/TargetedCompetence');
const TargetedArea = require('../../domain/models/TargetedArea');
const Badge = require('../../domain/models/Badge');
const BadgeCriterion = require('../../domain/models/BadgeCriterion');
const BadgePartnerCompetence = require('../../domain/models/BadgePartnerCompetence');
const Stage = require('../../domain/models/Stage');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const tubeDatasource = require('../datasources/learning-content/tube-datasource');
const competenceDatasource = require('../datasources/learning-content/competence-datasource');
const areaDatasource = require('../datasources/learning-content/area-datasource');
const { NotFoundError, TargetProfileInvalidError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const { getTranslatedText } = require('../../domain/services/get-translated-text');

module.exports = {

  async get({ id, locale = FRENCH_FRANCE }) {
    const whereClauseFnc = (queryBuilder) => {
      return queryBuilder
        .where('target-profiles.id', id);
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
    .select('target-profiles.id', 'target-profiles.name', 'target-profiles.outdated', 'target-profiles.isPublic', 'target-profiles.ownerOrganizationId', 'target-profiles_skills.skillId')
    .leftJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id');
  const finalQueryBuilder = whereClauseFnc(baseQueryBuilder);
  const results = await finalQueryBuilder;

  if (_.isEmpty(results)) {
    throw new NotFoundError('Le profil cible n\'existe pas');
  }

  const badges = await _findBadges(results[0].id);
  const stages = await _findStages(results[0].id);
  return _toDomain(results, badges, stages, locale);
}

async function _toDomain(results, badges, stages, locale) {
  const skillIds = _.compact(results.map(({ skillId }) => skillId));
  const {
    skills,
    tubes,
    competences,
    areas,
  } = await _getTargetedLearningContent(skillIds, locale);

  return new TargetProfileWithLearningContent({
    id: results[0].id,
    name: results[0].name,
    outdated: results[0].outdated,
    isPublic: results[0].isPublic,
    ownerOrganizationId: results[0].ownerOrganizationId,
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
    const practicalTitle = getTranslatedText(locale, { frenchText: learningContentTube.practicalTitleFrFr, englishText: learningContentTube.practicalTitleEnUs });
    const description = getTranslatedText(locale, { frenchText: learningContentTube.practicalDescriptionFrFr, englishText: learningContentTube.practicalDescriptionEnUs });
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
    const name = getTranslatedText(locale, { frenchText: learningContentCompetence.nameFrFr, englishText: learningContentCompetence.nameEnUs });
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
    const title = getTranslatedText(locale, { frenchText: learningContentArea.titleFrFr, englishText: learningContentArea.titleEnUs });
    return new TargetedArea({
      ...learningContentArea,
      title,
      competences: competencesByAreaId[learningContentArea.id],
    });
  });
}

async function _findStages(targetProfileId) {
  const stageRows = await knex('stages')
    .select('stages.id', 'stages.threshold', 'stages.message', 'stages.title')
    .where('stages.targetProfileId', targetProfileId);

  if (_.isEmpty(stageRows)) {
    return [];
  }

  return stageRows.map((row) => new Stage(row));
}

async function _findBadges(targetProfileId) {
  const badgeRows = await knex('badges')
    .select('badges.id', 'badges.key', 'badges.message', 'badges.altMessage', 'badges.title', 'badges.targetProfileId')
    .where('badges.targetProfileId', targetProfileId);

  if (_.isEmpty(badgeRows)) {
    return [];
  }

  const badges = badgeRows.map((row) => new Badge({ ...row, imageUrl: null }));
  await _fillBadgesWithCriteria(badges);
  await _fillBadgesWithPartnerCompetences(badges);

  return badges;
}

async function _fillBadgesWithCriteria(badges) {
  const badgeIds = badges.map((badge) => badge.id);
  const criteriaRows = await knex('badge-criteria')
    .select('badge-criteria.id', 'badge-criteria.scope', 'badge-criteria.threshold', 'badge-criteria.badgeId')
    .whereIn('badge-criteria.badgeId', badgeIds);

  const criteriaRowsByBadgeId = _.groupBy(criteriaRows, 'badgeId');

  badges.forEach((badge) => {
    const criteriaRowsForBadge = criteriaRowsByBadgeId[badge.id];
    badge.badgeCriteria = _.map(criteriaRowsForBadge, (criteriaRow) => new BadgeCriterion(criteriaRow));
  });
}

async function _fillBadgesWithPartnerCompetences(badges) {
  const badgeIds = badges.map((badge) => badge.id);
  const partnerCompetencesRows = await knex('badge-partner-competences')
    .select('badge-partner-competences.id', 'badge-partner-competences.name', 'badge-partner-competences.color', 'badge-partner-competences.skillIds', 'badge-partner-competences.badgeId')
    .whereIn('badge-partner-competences.badgeId', badgeIds);

  const partnerCompetencesRowsByBadgeId = _.groupBy(partnerCompetencesRows, 'badgeId');

  badges.forEach((badge) => {
    const partnerCompetencesRowsForBadge = partnerCompetencesRowsByBadgeId[badge.id];
    badge.badgePartnerCompetences = _.map(partnerCompetencesRowsForBadge, (partnerCompetenceRow) => new BadgePartnerCompetence(partnerCompetenceRow));
  });
}
