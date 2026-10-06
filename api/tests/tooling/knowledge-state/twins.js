/**
 * Twin users for the differential acceptance tests of the knowledge states.
 *
 * Two users start with the same knowledge, one of them is migrated to
 * knowledge states, and both are driven through the same API calls, the way
 * a learner is: they ask for their next challenge and answer it. Whatever the
 * API gives them must be the same, once the ids and dates that differ by
 * construction are hidden.
 *
 * The learning content is a release of the LCMS, as the seeds load it.
 */
import { FAILSAFE_SCHEMA, load } from 'js-yaml';

import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import { usecases as campaignParticipationUsecases } from '../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { CampaignTypes } from '../../../src/prescription/shared/domain/constants.ts';
import { KnowledgeElement } from '../../../src/shared/domain/models/KnowledgeElement.js';
import { Membership } from '../../../src/shared/domain/models/Membership.js';
import { learningContentCache } from '../../../src/shared/infrastructure/caches/learning-content-redis-cache.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../src/shared/infrastructure/repositories/tube-repository.js';
import { databaseBuilder, knex } from '../databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../test-utils/http-server.js';
import { release } from './learning-content-release.js';

export { release };

const skillById = new Map(release.skills.map((skill) => [skill.id, skill]));
const challengeById = new Map(release.challenges.map((challenge) => [challenge.id, challenge]));

export const skillNamed = (name) => release.skills.find((skill) => skill.name === name);
export const tubeNamed = (name) => release.tubes.find((tube) => tube.name === name);
export const competenceNamed = (name) => release.competences.find((competence) => competence.name_i18n.fr === name);

export const buildLearningContent = () => databaseBuilder.factory.learningContent.build(release);

/**
 * The knowledge both twins start with, dated long ago so that competences can
 * be reset: `validated` and `invalidated` list skill names, each a direct
 * answer with its inferences.
 */
const buildInitialKnowledge = (userId, { validated, invalidated }) => {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  const build = (skill, status, source) =>
    databaseBuilder.factory.buildKnowledgeElement({
      userId,
      assessmentId,
      skillId: skill.id,
      competenceId: skill.competenceId,
      status,
      source,
      earnedPix: status === KnowledgeElement.StatusType.VALIDATED ? skill.pixValue : 0,
      createdAt: new Date('2020-01-01'),
    });
  const inferredFrom = (skill, keepsLevel) =>
    release.skills.filter((other) => other.tubeId === skill.tubeId && other.id !== skill.id && keepsLevel(other.level));

  validated.map(skillNamed).forEach((skill) => {
    build(skill, 'validated', 'direct');
    inferredFrom(skill, (level) => level < skill.level).forEach((other) => build(other, 'validated', 'inferred'));
  });
  invalidated.map(skillNamed).forEach((skill) => {
    build(skill, 'invalidated', 'direct');
    inferredFrom(skill, (level) => level > skill.level).forEach((other) => build(other, 'invalidated', 'inferred'));
  });
};

/**
 * Builds the learning content and two users with the same knowledge, commits,
 * then migrates the first one.
 */
export const buildTwins = async ({ validated = [], invalidated = [] } = {}) => {
  buildLearningContent();
  const migrated = { name: 'migrated', userId: databaseBuilder.factory.buildUser().id };
  const other = { name: 'other', userId: databaseBuilder.factory.buildUser().id };
  buildInitialKnowledge(migrated.userId, { validated, invalidated });
  buildInitialKnowledge(other.userId, { validated, invalidated });
  await databaseBuilder.commit();
  await evaluationUsecases.migrateUserToKnowledgeStates({ userId: migrated.userId });

  return { migrated, other };
};

/**
 * An assessment campaign on the given tubes, with a prescriber who can read
 * its results. Call before `databaseBuilder.commit()`.
 */
export const buildCampaign = ({ tubes, multipleSendings = false, badges = [], stages = [] }) => {
  const organizationId = databaseBuilder.factory.buildOrganization().id;
  const prescriberId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildMembership({
    userId: prescriberId,
    organizationId,
    organizationRole: Membership.roles.MEMBER,
  });
  const targetProfileId = databaseBuilder.factory.buildTargetProfile({ areKnowledgeElementsResettable: true }).id;
  const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId, multipleSendings }).id;
  // Tubes come as names, or as names with the level they are capped at.
  const cappedTubes = Array.isArray(tubes) ? tubes.map((name) => [name, 8]) : Object.entries(tubes);
  cappedTubes.forEach(([name, level]) => {
    const tube = tubeNamed(name);
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: tube.id, level });
    tube.skillIds
      .filter((skillId) => skillById.get(skillId).level <= level)
      .forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
  });
  // Badges are earned at a mastery threshold on the participation, stages reached at one.
  badges.forEach((threshold, index) => {
    const badgeId = databaseBuilder.factory.buildBadge({
      targetProfileId,
      key: `badge_${index}`,
      isAlwaysVisible: true,
    }).id;
    databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({ badgeId, threshold });
  });
  stages.forEach((threshold, index) =>
    databaseBuilder.factory.buildStage({
      targetProfileId,
      threshold,
      title: `Palier ${index}`,
      message: `Message ${index}`,
    }),
  );

  return { campaignId, prescriberId };
};

/**
 * An exam campaign on the given tubes: the knowledge of a participation is
 * kept in its snapshot only, not in the learner's knowledge elements.
 * Call before `databaseBuilder.commit()`.
 */
export const buildExamCampaign = ({ tubes }) => {
  const organizationId = databaseBuilder.factory.buildOrganization().id;
  const prescriberId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildMembership({
    userId: prescriberId,
    organizationId,
    organizationRole: Membership.roles.MEMBER,
  });
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  const campaignId = databaseBuilder.factory.buildCampaign({
    organizationId,
    targetProfileId,
    type: CampaignTypes.EXAM,
  }).id;
  tubes.map(tubeNamed).forEach((tube) => {
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: tube.id, level: 8 });
    tube.skillIds.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
  });

  return { campaignId, prescriberId };
};

/**
 * A profiles collection campaign, with a prescriber who can read its
 * participations. Call before `databaseBuilder.commit()`.
 */
export const buildProfilesCollectionCampaign = ({ multipleSendings = false } = {}) => {
  const organizationId = databaseBuilder.factory.buildOrganization().id;
  const prescriberId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildMembership({
    userId: prescriberId,
    organizationId,
    organizationRole: Membership.roles.MEMBER,
  });
  const campaignId = databaseBuilder.factory.buildCampaign({
    organizationId,
    type: CampaignTypes.PROFILES_COLLECTION,
    targetProfileId: null,
    multipleSendings,
  }).id;

  return { campaignId, prescriberId };
};

/**
 * What a learner knows: a skill is known when its level is at most the level
 * known on its tube, the default level applying to every other tube.
 */
export const knowledge =
  ({ defaultLevel, tubes = {} }) =>
  (skill) =>
    skill.level <= (tubes[release.tubes.find(({ id }) => id === skill.tubeId)?.name] ?? defaultLevel);

const variablesOf = (proposals) => [...String(proposals).matchAll(/\$\{(\w+)[^}]*\}/g)].map(([, name]) => name);
const toYaml = (entries) => entries.map(([key, value]) => `${key}: ${value}`).join('\n');

/**
 * A right or wrong answer to a real challenge, built from its solution.
 */
export const answerValueFor = (challenge, isOk) => {
  const solution = String(challenge.solution ?? '');
  switch (challenge.type) {
    case 'QCU':
    case 'QCM':
      return isOk ? solution.trim() : 'wrong';
    case 'QROCM-ind': {
      const acceptedByKey = load(solution, { schema: FAILSAFE_SCHEMA });
      return toYaml(Object.entries(acceptedByKey).map(([key, accepted]) => [key, isOk ? accepted[0] : 'wrong']));
    }
    case 'QROCM-dep': {
      const groups = Object.values(load(solution, { schema: FAILSAFE_SCHEMA }));
      return toYaml(variablesOf(challenge.proposals).map((name, index) => [name, isOk ? groups[index][0] : 'wrong']));
    }
    default:
      return isOk ? solution.split('\n').find((line) => line.trim()) : 'wrong';
  }
};

const inject = (server, { userId, ...request }) =>
  server.inject({ ...request, headers: generateAuthenticatedUserRequestHeaders({ userId }) });

/**
 * What a user does, each call taking the user it is done as.
 */
export const actions = (server) => {
  const assessmentIdOf = (response) => Number(response.result.data.relationships.assessment.data.id);

  const startCompetenceEvaluation = async ({ userId }, competenceId) => {
    const response = await inject(server, {
      userId,
      method: 'POST',
      url: '/api/competence-evaluations/start-or-resume',
      payload: { competenceId },
    });
    return { statusCode: response.statusCode, assessmentId: assessmentIdOf(response) };
  };

  const improveCompetenceEvaluation = async ({ userId }, competenceId) => {
    const response = await inject(server, {
      userId,
      method: 'PUT',
      url: '/api/competence-evaluations/improve',
      payload: { competenceId },
    });
    return { statusCode: response.statusCode, assessmentId: assessmentIdOf(response) };
  };

  const nextChallenge = async ({ userId }, assessmentId) => {
    const response = await inject(server, { userId, method: 'GET', url: `/api/assessments/${assessmentId}` });
    const challengeId = response.result.data.relationships['next-challenge']?.data?.id ?? null;
    return { statusCode: response.statusCode, challenge: challengeId ? challengeById.get(challengeId) : null };
  };

  const answer = async ({ userId }, { assessmentId, challenge, isOk }) => {
    const response = await inject(server, {
      userId,
      method: 'POST',
      url: '/api/answers',
      payload: {
        data: {
          type: 'answers',
          attributes: { value: answerValueFor(challenge, isOk) },
          relationships: {
            assessment: { data: { type: 'assessments', id: assessmentId } },
            challenge: { data: { type: 'challenges', id: challenge.id } },
          },
        },
      },
    });
    return { statusCode: response.statusCode, result: response.result.data?.attributes?.result ?? response.result };
  };

  const completeAssessment = async ({ userId }, assessmentId) => {
    const response = await inject(server, {
      userId,
      method: 'PATCH',
      url: `/api/assessments/${assessmentId}/complete-assessment`,
    });
    return { statusCode: response.statusCode };
  };

  /**
   * Plays an assessment to its end as a learner does: asks the next
   * challenge, answers it from what the learner knows, until none is left,
   * then completes it. Gives back what was asked and answered.
   */
  const play = async (twin, assessmentId, knows) => {
    const played = [];
    for (
      let next = await nextChallenge(twin, assessmentId);
      next.challenge;
      next = await nextChallenge(twin, assessmentId)
    ) {
      const skill = skillById.get(next.challenge.skillId);
      const isOk = knows(skill);
      const answered = await answer(twin, { assessmentId, challenge: next.challenge, isOk });
      played.push({ skill: skill.name, isOk, result: answered.result, statusCode: answered.statusCode });
      if (answered.statusCode !== 201) break;
    }
    const completed = await completeAssessment(twin, assessmentId);
    return { played, completed: completed.statusCode };
  };

  const resetCompetence = async ({ userId }, competenceId) => {
    const response = await inject(server, {
      userId,
      method: 'POST',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
    });
    return { statusCode: response.statusCode };
  };

  const startCampaignParticipation = async ({ userId }, { campaignId, isRetry = false, isReset = false }) => {
    const response = await inject(server, {
      userId,
      method: 'POST',
      url: '/api/campaign-participations',
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: { 'participant-external-id': null, 'is-retry': isRetry, 'is-reset': isReset },
          relationships: { campaign: { data: { id: String(campaignId), type: 'campaigns' } } },
        },
      },
    });
    const campaignParticipationId = Number(response.result.data.id);
    const assessment = await knex('assessments').where({ campaignParticipationId }).orderBy('id', 'desc').first();
    return { statusCode: response.statusCode, campaignParticipationId, assessmentId: assessment?.id ?? null };
  };

  // A profiles collection participation is shared by the learner, there is no assessment to complete.
  const shareCampaignParticipation = async ({ userId }, campaignParticipationId) => {
    const response = await inject(server, {
      userId,
      method: 'PATCH',
      url: `/api/campaign-participations/${campaignParticipationId}`,
    });
    return { statusCode: response.statusCode };
  };

  // Completing a campaign assessment shares its results. The results are then
  // computed by a job: both twins get it run here.
  const computeCampaignResults = (_twin, campaignParticipationId) =>
    campaignParticipationUsecases.saveComputedCampaignParticipationResult({ campaignParticipationId });

  return {
    startCompetenceEvaluation,
    improveCompetenceEvaluation,
    nextChallenge,
    answer,
    completeAssessment,
    play,
    resetCompetence,
    startCampaignParticipation,
    shareCampaignParticipation,
    computeCampaignResults,
  };
};

/**
 * Moves of the learning content between two steps, as the content team makes
 * them. The caches are cleared as a release refresh clears them, so that the
 * API sees the moves.
 */
export const learningContentMoves = () => {
  const clearCaches = async () => {
    await learningContentCache.clear();
    skillRepository.clearCache();
    tubeRepository.clearCache();
    challengeRepository.clearCache();
  };

  const changePixValue = async (skillName, pixValue) => {
    await knex('learningcontent.skills')
      .where({ id: skillNamed(skillName).id })
      .update({ pixValue });
    await clearCaches();
  };

  /** Archives a skill and replaces it by a new version with the same challenges. */
  const replaceByNewVersion = async (skillName) => {
    const skill = skillNamed(skillName);
    const newSkill = { ...skill, id: `${skill.id}_v2`, status: 'actif', version: (skill.version ?? 1) + 1 };
    const skillRow = await knex('learningcontent.skills').where({ id: skill.id }).first();
    await knex('learningcontent.skills').where({ id: skill.id }).update({ status: 'archivé' });
    await knex('learningcontent.skills').insert({
      ...skillRow,
      id: newSkill.id,
      status: 'actif',
      version: newSkill.version,
    });
    const tube = release.tubes.find(({ id }) => id === skill.tubeId);
    await knex('learningcontent.tubes')
      .where({ id: tube.id })
      .update({ skillIds: [...tube.skillIds, newSkill.id] });
    for (const challenge of release.challenges.filter(({ skillId }) => skillId === skill.id)) {
      const row = await knex('learningcontent.challenges').where({ id: challenge.id }).first();
      const newChallenge = { ...challenge, id: `${challenge.id}_v2`, skillId: newSkill.id };
      await knex('learningcontent.challenges').insert({ ...row, id: newChallenge.id, skillId: newSkill.id });
      challengeById.set(newChallenge.id, newChallenge);
    }
    skillById.set(newSkill.id, newSkill);
    await clearCaches();
    return newSkill;
  };

  return { changePixValue, replaceByNewVersion };
};

const ISO_DATE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g;

// Every id the API may show about a user: their own, and those of the rows hanging on them.
const idsOf = async (userId) => {
  const idsIn = async (table) => (await knex(table).select('id').where({ userId })).map(({ id }) => id);
  const answerIds = (
    await knex('answers')
      .select('answers.id')
      .join('assessments', 'assessments.id', 'answers.assessmentId')
      .where('assessments.userId', userId)
  ).map(({ id }) => id);

  return [
    userId,
    ...(await idsIn('assessments')),
    ...(await idsIn('competence-evaluations')),
    ...(await idsIn('campaign-participations')),
    ...(await idsIn('organization-learners')),
    ...answerIds,
  ];
};

/**
 * The response as it can be compared between twins: the ids of the given
 * users and of their rows become `<id>`, the timestamps become `<date>`.
 */
const comparable = async (response, twins) => {
  const ids = (await Promise.all([twins].flat().map(({ userId }) => idsOf(userId)))).flat();
  const text = ids.reduce(
    (json, id) => json.replaceAll(new RegExp(`(?<![\\d.])${id}(?![\\d.])`, 'g'), '<id>'),
    JSON.stringify(response.result),
  );
  // An id given as a bare number must stay valid JSON once masked.
  const quoted = text.replace(/(?<=[:[,])<id>(?=[,\]}])/g, '"<id>"');
  return { statusCode: response.statusCode, body: JSON.parse(quoted.replace(ISO_DATE, '<date>')) };
};

/**
 * What a user or a prescriber reads, already made comparable.
 */
export const readings = (server) => {
  const read = async (twin, request) => comparable(await inject(server, { userId: twin.userId, ...request }), twin);

  const profile = (twin) => read(twin, { method: 'GET', url: `/api/users/${twin.userId}/profile` });

  const scorecard = (twin, competenceId) =>
    read(twin, { method: 'GET', url: `/api/scorecards/${twin.userId}_${competenceId}` });

  const certifiability = (twin) => read(twin, { method: 'GET', url: `/api/users/${twin.userId}/is-certifiable` });

  const campaignAssessmentResult = (twin, campaignId) =>
    read(twin, { method: 'GET', url: `/api/users/${twin.userId}/campaigns/${campaignId}/assessment-result` });

  const campaignParticipations = (twin, campaignId) =>
    read(twin, { method: 'GET', url: `/api/users/${twin.userId}/campaigns/${campaignId}/campaign-participations` });

  const sharedProfile = (twin, campaignId) =>
    read(twin, { method: 'GET', url: `/api/users/${twin.userId}/campaigns/${campaignId}/profile` });

  // Read by the prescriber about one twin or both: their ids are the ones to hide.
  const readAsPrescriber = async (twins, prescriberId, url) =>
    comparable(await inject(server, { userId: prescriberId, method: 'GET', url }), twins);

  const prescriberAssessmentResults = (twins, { prescriberId, campaignId }) =>
    readAsPrescriber(twins, prescriberId, `/api/campaigns/${campaignId}/assessment-results`);

  const prescriberCollectiveResults = (twins, { prescriberId, campaignId }) =>
    readAsPrescriber(twins, prescriberId, `/api/campaigns/${campaignId}/collective-results`);

  const prescriberProfiles = (twins, { prescriberId, campaignId }) =>
    readAsPrescriber(twins, prescriberId, `/api/campaigns/${campaignId}/profiles-collection-participations`);

  const prescriberProfile = (twin, { prescriberId, campaignId, campaignParticipationId }) =>
    readAsPrescriber(
      twin,
      prescriberId,
      `/api/campaigns/${campaignId}/profiles-collection-participations/${campaignParticipationId}`,
    );

  const prescriberParticipationResults = (twin, { prescriberId, campaignId, campaignParticipationId }) =>
    readAsPrescriber(
      twin,
      prescriberId,
      `/api/campaigns/${campaignId}/assessment-participations/${campaignParticipationId}/results`,
    );

  return {
    profile,
    scorecard,
    certifiability,
    campaignAssessmentResult,
    campaignParticipations,
    sharedProfile,
    prescriberProfiles,
    prescriberProfile,
    prescriberAssessmentResults,
    prescriberCollectiveResults,
    prescriberParticipationResults,
  };
};
