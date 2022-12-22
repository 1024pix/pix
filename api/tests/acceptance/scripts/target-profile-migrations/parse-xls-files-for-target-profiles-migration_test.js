const { expect, databaseBuilder, sinon, mockLearningContent, knex } = require('../../../test-helper');
const logger = require('../../../../lib/infrastructure/logger');

const {
  doJob,
} = require('../../../../scripts/prod/target-profile-migrations/parse-xls-files-for-target-profiles-migration');

const tubeIdPartageDroits = 'recd3rYCdpWLtHXLk';
const PATH_TO_GENERIC_XLS = `${__dirname}/migration-test.xlsx`;
const PATH_TO_MULTIFORM_XLS = `${__dirname}/migration-test-multiform.xlsx`;

describe('Acceptance | Scripts | parse-xls-files-for-target-profiles-migration', function () {
  afterEach(async function () {
    await knex('target-profile_tubes').delete();
  });

  it('should execute the script as expected', async function () {
    this.timeout(10000);

    // given
    sinon.stub(logger, 'info');
    const loggerErrorStub = sinon.stub(logger, 'error');
    const loggerWarnStub = sinon.stub(logger, 'warn');
    const TARGET_PROFILE_ID_TO_OUTDATE = 2001;
    const TARGET_PROFILE_ID_AUTO = 2002;
    const TARGET_PROFILE_ID_UNCAP = 2003;
    const TARGET_PROFILE_ID_UNIFORM_CAP = 2004;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_1 = 2005;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_2 = 2006;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_3 = 2007;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_4 = 2008;
    const TARGET_PROFILE_ID_UNIFORM_CAP_SUP = 2009;
    const learningContent = _mockLearningContent();
    [
      TARGET_PROFILE_ID_TO_OUTDATE,
      TARGET_PROFILE_ID_AUTO,
      TARGET_PROFILE_ID_UNCAP,
      TARGET_PROFILE_ID_UNIFORM_CAP,
      TARGET_PROFILE_ID_MULTIFORM_CAP_1,
      TARGET_PROFILE_ID_MULTIFORM_CAP_2,
      TARGET_PROFILE_ID_MULTIFORM_CAP_3,
      TARGET_PROFILE_ID_UNIFORM_CAP_SUP,
    ].forEach((targetProfileId) => _buildTargetProfileWithAllSkills(targetProfileId, learningContent.skills));
    _buildTargetProfileWithAllSkillsExceptPartageDroits(TARGET_PROFILE_ID_MULTIFORM_CAP_4, learningContent.skills);
    await databaseBuilder.commit();

    // when
    await doJob(PATH_TO_GENERIC_XLS, [PATH_TO_MULTIFORM_XLS]);

    // then
    const tubesAndSkillsForToOutdate = await _getTubesAndSkills(TARGET_PROFILE_ID_TO_OUTDATE);
    const tubesAndSkillsForAuto = await _getTubesAndSkills(TARGET_PROFILE_ID_AUTO);
    const tubesAndSkillsForUncap = await _getTubesAndSkills(TARGET_PROFILE_ID_UNCAP);
    const tubesAndSkillsForUniformCap = await _getTubesAndSkills(TARGET_PROFILE_ID_UNIFORM_CAP);
    const tubesAndSkillsForMultiformCap1 = await _getTubesAndSkills(TARGET_PROFILE_ID_MULTIFORM_CAP_1);
    const tubesAndSkillsForMultiformCap2 = await _getTubesAndSkills(TARGET_PROFILE_ID_MULTIFORM_CAP_2);
    const tubesAndSkillsForMultiformCap3 = await _getTubesAndSkills(TARGET_PROFILE_ID_MULTIFORM_CAP_3);
    const tubesAndSkillsForMultiformCap4 = await _getTubesAndSkills(TARGET_PROFILE_ID_MULTIFORM_CAP_4);
    const tubesAndSkillsForUniformCapSup = await _getTubesAndSkills(TARGET_PROFILE_ID_UNIFORM_CAP_SUP);
  });
});

async function _getTubesAndSkills(targetProfileId) {
  const tubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', targetProfileId)
    .orderBy('tubeId', 'ASC');
  const skills = await knex('target-profiles_skills')
    .pluck('skillId')
    .where('targetProfileId', targetProfileId)
    .orderBy('skillId', 'ASC');
  return { tubes, skills };
}

function _buildTargetProfileWithAllSkills(id, skills) {
  databaseBuilder.factory.buildTargetProfile({ id });
  skills.forEach((skill) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: id,
      skillId: skill.id,
    })
  );
}

function _buildTargetProfileWithAllSkillsExceptPartageDroits(id, skills) {
  databaseBuilder.factory.buildTargetProfile({ id });
  skills.forEach((skill) => {
    if (skill.tubeId !== tubeIdPartageDroits)
      databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: id,
        skillId: skill.id,
      });
  });
}

function _mockLearningContent() {
  const learningContent = {
    skills: [],
    tubes: [],
  };
  const tubeIdCodageEmblematique = 'recJJVWsUD0A4g7bf';
  learningContent.tubes.push({
    id: tubeIdCodageEmblematique,
    name: '@codageEmblématique',
  });
  const skillIdsCodageEmblematique = {
    3: 'recXO3Ei4vf25mJE7',
    4: 'recVfp1idTGE727dl',
    5: 'rec3wTu36JBVMu70s',
    6: 'recqUtUE0mrjZYmcI',
    7: 'recCQPm1mgdexw3jV',
  };
  for (const [level, id] of Object.entries(skillIdsCodageEmblematique)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdCodageEmblematique,
      level,
    });
  }
  const tubeIdTerminal = 'rec1ahEQ4rwrml6Lo';
  learningContent.tubes.push({
    id: tubeIdTerminal,
    name: '@terminal',
  });
  const skillIdsTerminal = {
    3: 'recNXnzzW5yvqQlA',
    4: 'rec2Qat2a1iwKpqR2',
    5: 'rec145HIb1bvzOuod',
  };
  for (const [level, id] of Object.entries(skillIdsTerminal)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdTerminal,
      level,
    });
  }
  const tubeIdEditerDocEnLigne = 'reciWLZDyQmXNn6lc';
  learningContent.tubes.push({
    id: tubeIdEditerDocEnLigne,
    name: '@editerDocEnLigne',
  });
  const skillIdsEditerDocEnLigne = {
    1: 'recXDYAkqqIDCDePc',
    4: 'recwOLZ8bzMQK9NF9',
  };
  for (const [level, id] of Object.entries(skillIdsEditerDocEnLigne)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdEditerDocEnLigne,
      level,
    });
  }
  learningContent.tubes.push({
    id: tubeIdPartageDroits,
    name: '@partageDroits',
  });
  const skillIdsPartageDroits = {
    2: 'rec7EvARki1b9t574',
    4: 'recqSPZiRJYzfCDaS',
    5: 'recp7rTXpecbxjE5d',
    6: 'recIyRA2zdCdlX6UD',
  };
  for (const [level, id] of Object.entries(skillIdsPartageDroits)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdPartageDroits,
      level,
    });
  }
  mockLearningContent(learningContent);
  return learningContent;
}
