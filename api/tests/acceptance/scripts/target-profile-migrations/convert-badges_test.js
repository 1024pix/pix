const _ = require('lodash');
const { expect, databaseBuilder, sinon, mockLearningContent } = require('../../../test-helper');
const { knex } = require('../../../../db/knex-database-connection');
const logger = require('../../../../lib/infrastructure/logger');

const { doJob } = require('../../../../scripts/prod/target-profile-migrations/convert-badges');

describe('Acceptance | Scripts | convert-badges', function () {
  it('should execute the script as expected', async function () {
    // given
    sinon.stub(logger, 'info');
    const loggerErrorStub = sinon.stub(logger, 'error');
    const badgeAlreadyConvertedId = 1;
    const badgeToConvertId = 2;
    const badgeWithNoSkillSetsId = 3;
    const badgeConversionErrorTargetProfileTubesTooLowLevelId = 4;
    const badgeConversionErrorTubeNotInTargetProfile = 5;
    const badgeConversionErrorUnknownSkillId = 6;
    const badgeConversionErrorNoCorrespondingTubeId = 7;
    const learningContent = {
      skills: [],
      tubes: [],
    };
    _buildBadgeAlreadyConverted(badgeAlreadyConvertedId);
    _buildBadgeToConvert(badgeToConvertId, learningContent);
    _buildBadgeWithNoSkillSets(badgeWithNoSkillSetsId);
    _buildBadgeWithConversionErrorTargetProfileTubesTooLowLevel(
      badgeConversionErrorTargetProfileTubesTooLowLevelId,
      learningContent
    );
    _buildBadgeWithConversionErrorTubeNotInTargetProfile(badgeConversionErrorTubeNotInTargetProfile, learningContent);
    _buildBadgeWithConversionErrorUnknownSkillId(badgeConversionErrorUnknownSkillId);
    _buildBadgeWithConversionErrorNoCorrespondingTubeId(badgeConversionErrorNoCorrespondingTubeId, learningContent);

    mockLearningContent(learningContent);
    await databaseBuilder.commit();

    // when
    await doJob();

    // then
    const criteriaForAlreadyConverted = await _getCriteria(badgeAlreadyConvertedId);
    const criteriaForToConvert = await _getCriteria(badgeToConvertId);
    const criteriaForNoSkillSets = await _getCriteria(badgeWithNoSkillSetsId);
    const criteriaForErrorLowerLevel = await _getCriteria(badgeConversionErrorTargetProfileTubesTooLowLevelId);
    const criteriaForErrorTubeNotInTargetProfile = await _getCriteria(badgeConversionErrorTubeNotInTargetProfile);
    const criteriaForErrorUnknownSkill = await _getCriteria(badgeConversionErrorUnknownSkillId);
    const criteriaForErrorNoCorrespondingTube = await _getCriteria(badgeConversionErrorNoCorrespondingTubeId);

    expect(criteriaForAlreadyConverted).to.deep.equal(
      [
        { scope: 'CampaignParticipation', threshold: 20, name: null },
        {
          scope: 'CappedTubes',
          threshold: 25,
          name: null,
          cappedTubes: [{ id: 'alreadyConvertedTubeId', level: 1 }],
        },
      ],
      'Echec RT déjà converti'
    );
    expect(criteriaForToConvert).to.deep.equal(
      [
        { scope: 'CampaignParticipation', threshold: 30, name: null },
        {
          scope: 'CappedTubes',
          name: 'Critère1SkillSet1',
          threshold: 35,
          cappedTubes: [
            { id: 'tubeA', level: 3 },
            { id: 'tubeB', level: 4 },
          ],
        },
        {
          scope: 'CappedTubes',
          name: 'Critère1SkillSet2',
          threshold: 35,
          cappedTubes: [
            { id: 'tubeA', level: 5 },
            { id: 'tubeC', level: 7 },
          ],
        },
        {
          scope: 'CappedTubes',
          name: 'Critère2SkillSet1',
          threshold: 36,
          cappedTubes: [
            { id: 'tubeB', level: 1 },
            { id: 'tubeC', level: 3 },
          ],
        },
      ],
      'Echec RT à convertir'
    );
    expect(criteriaForNoSkillSets).to.deep.equal(
      [{ scope: 'CampaignParticipation', threshold: 40, name: null }],
      'Echec RT sans skill sets'
    );
    expect(criteriaForErrorLowerLevel).to.deep.equal(
      [
        {
          scope: 'SkillSet',
          name: null,
          threshold: 50,
          skillSets: [{ name: 'OnlyCriterion', skillIds: ['skill2TubeD', 'skill4TubeD'] }],
        },
      ],
      'Echec RT avec niveau supérieur au profil cible'
    );
    expect(criteriaForErrorTubeNotInTargetProfile).to.deep.equal(
      [
        {
          scope: 'SkillSet',
          name: null,
          threshold: 50,
          skillSets: [{ name: 'OnlyCriterion', skillIds: ['skill2TubeF'] }],
        },
      ],
      'Echec RT avec acquis non présent dans le profil cible'
    );
    expect(criteriaForErrorUnknownSkill).to.deep.equal(
      [
        {
          scope: 'SkillSet',
          name: null,
          threshold: 50,
          skillSets: [{ name: 'OnlyCriterion', skillIds: ['unknownSkillId'] }],
        },
      ],
      'Echec RT avec acquis inconnu'
    );
    expect(criteriaForErrorNoCorrespondingTube).to.deep.equal(
      [
        {
          scope: 'SkillSet',
          name: null,
          threshold: 50,
          skillSets: [{ name: 'OnlyCriterion', skillIds: ['skillWithoutTube'] }],
        },
      ],
      'Echec RT acquis sans sujet'
    );
    expect(loggerErrorStub).to.have.been.calledWith(
      '4 Echec. Raison : Error: Le RT contient des acquis avec un niveau supérieur au profil cible.'
    );
    expect(loggerErrorStub).to.have.been.calledWith(
      '5 Echec. Raison : Error: Le RT contient des acquis qui ne sont pas compris dans le profil cible.'
    );
    expect(loggerErrorStub).to.have.been.calledWith(
      `6 Echec. Raison : Error: L'acquis "unknownSkillId" n'existe pas dans le référentiel.`
    );
    expect(loggerErrorStub).to.have.been.calledWith(
      `7 Echec. Raison : Error: Le sujet "someUnknownTube" n'existe pas dans le référentiel.`
    );
  });
});

async function _getCriteria(badgeId) {
  const rawCriteria = await knex('badge-criteria')
    .select('scope', 'threshold', 'cappedTubes', 'skillSetIds', 'name')
    .where({ badgeId })
    .orderBy('threshold', 'ASC');
  const criteria = [];
  for (const rawCriterion of rawCriteria) {
    const criterion = { scope: rawCriterion.scope, threshold: rawCriterion.threshold, name: rawCriterion.name };
    if (rawCriterion.scope === 'CappedTubes') {
      criterion.cappedTubes = rawCriterion.cappedTubes;
    } else if (rawCriterion.scope === 'SkillSet') {
      const skillSets = [];
      for (const skillSetId of rawCriterion.skillSetIds) {
        skillSets.push(
          ...(await knex('skill-sets').select('name', 'skillIds').where({ id: skillSetId }).orderBy('name', 'ASC'))
        );
      }
      criterion.skillSets = skillSets;
    }
    criteria.push(criterion);
  }
  return criteria;
}

function _buildBadgeAlreadyConverted(badgeId) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({
    tubeId: 'alreadyConvertedTubeId',
    level: 9000,
    targetProfileId,
  });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({ threshold: 20, badgeId });
  databaseBuilder.factory.buildBadgeCriterion.scopeCappedTubes({
    threshold: 25,
    badgeId,
    cappedTubes: JSON.stringify([{ id: 'alreadyConvertedTubeId', level: 1 }]),
  });
}

function _buildBadgeToConvert(badgeId, learningContent) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeA', level: 5, targetProfileId });
  databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeB', level: 6, targetProfileId });
  databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeC', level: 8, targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({ threshold: 30, badgeId });
  const criteria1SkillSetId1 = databaseBuilder.factory.buildSkillSet({
    name: 'Critère1SkillSet1',
    skillIds: ['skill1TubeA', 'skill3TubeA', 'skill4TubeB'],
  }).id;
  const criteria1SkillSetId2 = databaseBuilder.factory.buildSkillSet({
    name: 'Critère1SkillSet2',
    skillIds: ['skill2TubeA', 'skill4TubeA', 'skill5TubeA', 'skill1TubeC', 'skill4TubeC', 'skill7TubeC'],
  }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 35,
    badgeId,
    skillSetIds: [criteria1SkillSetId1, criteria1SkillSetId2],
  });
  const criteria2SkillSetId1 = databaseBuilder.factory.buildSkillSet({
    name: 'Critère2SkillSet1',
    skillIds: ['skill1TubeB', 'skill1TubeC', 'skill2TubeC', 'skill3TubeC'],
  }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 36,
    badgeId,
    skillSetIds: [criteria2SkillSetId1],
  });

  // Insert skills up to level 8 for three tubes
  const tubes = {
    A: { id: 'tubeA', skills: [] },
    B: { id: 'tubeB', skills: [] },
    C: { id: 'tubeC', skills: [] },
  };
  for (const letter of ['A', 'B', 'C']) {
    const skills = _.times(8, (i) => ({
      id: `skill${i + 1}Tube${letter}`,
      name: `@skill${i + 1}Tube${letter}`,
      tubeId: `tube${letter}`,
      level: i + 1,
    }));
    tubes[letter].skills.push(...skills);
    learningContent.skills.push(...skills);
    learningContent.tubes.push(tubes[letter]);
  }
}

function _buildBadgeWithNoSkillSets(badgeId) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({ threshold: 40, badgeId });
}

function _buildBadgeWithConversionErrorTargetProfileTubesTooLowLevel(badgeId, learningContent) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeD', level: 3, targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  const skillSetId = databaseBuilder.factory.buildSkillSet({
    name: 'OnlyCriterion',
    skillIds: ['skill2TubeD', 'skill4TubeD'],
  }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 50,
    badgeId,
    skillSetIds: [skillSetId],
  });

  const tube = { id: 'tubeD', skills: [] };
  const skills = _.times(8, (i) => ({
    id: `skill${i + 1}TubeD`,
    name: `@skill${i + 1}TubeD`,
    tubeId: `tubeD`,
    level: i + 1,
  }));
  tube.skills.push(...skills);
  learningContent.skills.push(...skills);
  learningContent.tubes.push(tube);
}

function _buildBadgeWithConversionErrorTubeNotInTargetProfile(badgeId, learningContent) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeE', level: 3, targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  const skillSetId = databaseBuilder.factory.buildSkillSet({
    name: 'OnlyCriterion',
    skillIds: ['skill2TubeF'],
  }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 50,
    badgeId,
    skillSetIds: [skillSetId],
  });

  // Insert skills up to level 8 for three tubes
  const tubes = {
    E: { id: 'tubeE', skills: [] },
    F: { id: 'tubeF', skills: [] },
  };
  for (const letter of ['E', 'F']) {
    const skills = _.times(8, (i) => ({
      id: `skill${i + 1}Tube${letter}`,
      name: `@skill${i + 1}Tube${letter}`,
      tubeId: `tube${letter}`,
      level: i + 1,
    }));
    tubes[letter].skills.push(...skills);
    learningContent.skills.push(...skills);
    learningContent.tubes.push(tubes[letter]);
  }
}

function _buildBadgeWithConversionErrorUnknownSkillId(badgeId) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  const skillSetId = databaseBuilder.factory.buildSkillSet({ name: 'OnlyCriterion', skillIds: ['unknownSkillId'] }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 50,
    badgeId,
    skillSetIds: [skillSetId],
  });
}

function _buildBadgeWithConversionErrorNoCorrespondingTubeId(badgeId, learningContent) {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  databaseBuilder.factory.buildTargetProfileTube({ targetProfileId });
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, key: `badge_${badgeId}` });
  const skillSetId = databaseBuilder.factory.buildSkillSet({
    name: 'OnlyCriterion',
    skillIds: ['skillWithoutTube'],
  }).id;
  databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
    threshold: 50,
    badgeId,
    skillSetIds: [skillSetId],
  });

  const skill = {
    id: 'skillWithoutTube',
    name: '@skillWithoutTube',
    tubeId: 'someUnknownTube',
    level: 2,
  };
  learningContent.skills.push(skill);
}
