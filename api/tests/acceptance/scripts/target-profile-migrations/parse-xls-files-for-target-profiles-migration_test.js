const { expect, databaseBuilder, sinon, mockLearningContent, knex } = require('../../../test-helper');
const logger = require('../../../../lib/infrastructure/logger');

const {
  doJob,
} = require('../../../../scripts/prod/target-profile-migrations/parse-xls-files-for-target-profiles-migration');

const tubeIdCodageEmblematique = 'recJJVWsUD0A4g7bf';
const skillIdsCodageEmblematique = {
  3: 'recXO3Ei4vf25mJE7',
  4: 'recVfp1idTGE727dl',
  5: 'rec3wTu36JBVMu70s',
  6: 'recqUtUE0mrjZYmcI',
  7: 'recCQPm1mgdexw3jV',
};
const maxSkillLevelCodageEmblematique = Math.max(...Object.keys(skillIdsCodageEmblematique).map((l) => +l));

const tubeIdTerminal = 'rec1ahEQ4rwrml6Lo';
const skillIdsTerminal = {
  3: 'recNXnzzW5yvqQlA',
  4: 'rec2Qat2a1iwKpqR2',
  5: 'rec145HIb1bvzOuod',
};
const maxSkillLevelTerminal = Math.max(...Object.keys(skillIdsTerminal).map((l) => +l));

const tubeIdEditerDocEnLigne = 'reciWLZDyQmXNn6lc';
const skillIdsEditerDocEnLigne = {
  1: 'recXDYAkqqIDCDePc',
  4: 'recwOLZ8bzMQK9NF9',
};
const maxSkillLevelEditerDocEnLigne = Math.max(...Object.keys(skillIdsEditerDocEnLigne).map((l) => +l));

const tubeIdPartageDroits = 'recd3rYCdpWLtHXLk';
const skillIdsPartageDroits = {
  2: 'rec7EvARki1b9t574',
  4: 'recqSPZiRJYzfCDaS',
  5: 'recp7rTXpecbxjE5d',
  6: 'recIyRA2zdCdlX6UD',
};
const maxSkillLevelPartageDroits = Math.max(...Object.keys(skillIdsPartageDroits).map((l) => +l));

const PATH_TO_GENERIC_XLS = `${__dirname}/migration-test.xlsx`;
const PATH_TO_MULTIFORM_1_XLS = `${__dirname}/migration-test-multiform_1.xlsx`;
const PATH_TO_MULTIFORM_2_XLS = `${__dirname}/migration-test-multiform_2.xlsx`;

describe('Acceptance | Scripts | parse-xls-files-for-target-profiles-migration', function () {
  afterEach(async function () {
    await knex('target-profile_tubes').delete();
  });

  it('should execute the script as expected', async function () {
    this.timeout(60000);

    // given
    sinon.stub(logger, 'info');
    const loggerErrorStub = sinon.stub(logger, 'error');
    const loggerWarnStub = sinon.stub(logger, 'warn');
    const TARGET_PROFILE_ID_TO_OUTDATE = 2001;
    const TARGET_PROFILE_ID_AUTO = 2002;
    const TARGET_PROFILE_ID_UNCAP = 2003;
    const TARGET_PROFILE_ID_UNCAP_2 = 2011;
    const TARGET_PROFILE_ID_UNIFORM_CAP = 2004;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_1 = 2005;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_2 = 2006;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_3 = 2007;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_4 = 2008;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_5 = 2010;
    const TARGET_PROFILE_ID_MULTIFORM_CAP_6 = 2012;
    const TARGET_PROFILE_ID_UNCAP_SUP = 2009;
    const learningContent = _mockLearningContent();
    [
      TARGET_PROFILE_ID_TO_OUTDATE,
      TARGET_PROFILE_ID_AUTO,
      TARGET_PROFILE_ID_UNCAP,
      TARGET_PROFILE_ID_UNCAP_2,
      TARGET_PROFILE_ID_UNIFORM_CAP,
      TARGET_PROFILE_ID_MULTIFORM_CAP_1,
      TARGET_PROFILE_ID_MULTIFORM_CAP_2,
      TARGET_PROFILE_ID_MULTIFORM_CAP_3,
      TARGET_PROFILE_ID_MULTIFORM_CAP_5,
      TARGET_PROFILE_ID_MULTIFORM_CAP_6,
      TARGET_PROFILE_ID_UNCAP_SUP,
    ].forEach((targetProfileId) => _buildTargetProfileWithAllSkills(targetProfileId, learningContent.skills));
    _buildTargetProfileWithAllSkills(
      TARGET_PROFILE_ID_MULTIFORM_CAP_4,
      learningContent.skills.filter((skill) => ![tubeIdPartageDroits].includes(skill.tubeId))
    );
    await databaseBuilder.commit();

    // when
    await doJob(PATH_TO_GENERIC_XLS, [PATH_TO_MULTIFORM_1_XLS, PATH_TO_MULTIFORM_2_XLS]);

    // then
    expect(loggerWarnStub).to.have.been.calledWith(
      { targetProfileId: 2000, targetProfileName: "Profil cible qui n'existe pas" },
      `Profil cible introuvable`
    );

    const { tubes: tubesForToOutdate, migrationStatus: migrationStatusOutdate } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_TO_OUTDATE
    );
    expect(tubesForToOutdate).to.deep.contain({
      tubeId: tubeIdCodageEmblematique,
      level: maxSkillLevelCodageEmblematique,
    });
    expect(tubesForToOutdate).to.deep.contain({ tubeId: tubeIdTerminal, level: maxSkillLevelTerminal });
    expect(tubesForToOutdate).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: maxSkillLevelEditerDocEnLigne });
    expect(tubesForToOutdate).to.deep.contain({ tubeId: tubeIdPartageDroits, level: maxSkillLevelPartageDroits });
    expect(migrationStatusOutdate).to.equal('AUTO');

    const { tubes: tubesForAuto, migrationStatus: migrationStatusAuto } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_AUTO
    );
    expect(tubesForAuto).to.deep.contain({
      tubeId: tubeIdCodageEmblematique,
      level: maxSkillLevelCodageEmblematique,
    });
    expect(tubesForAuto).to.deep.contain({ tubeId: tubeIdTerminal, level: maxSkillLevelTerminal });
    expect(tubesForAuto).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: maxSkillLevelEditerDocEnLigne });
    expect(tubesForAuto).to.deep.contain({ tubeId: tubeIdPartageDroits, level: maxSkillLevelPartageDroits });
    expect(migrationStatusAuto).to.equal('AUTO');

    const { tubes: tubesForUncap, migrationStatus: migrationStatusUncap } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_UNCAP
    );
    expect(tubesForUncap).to.deep.contain({ tubeId: tubeIdCodageEmblematique, level: 8 });
    expect(tubesForUncap).to.deep.contain({ tubeId: tubeIdTerminal, level: 8 });
    expect(tubesForUncap).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: 8 });
    expect(tubesForUncap).to.deep.contain({ tubeId: tubeIdPartageDroits, level: 8 });
    expect(migrationStatusUncap).to.equal('UNCAP');

    const { tubes: tubesForUncap2, migrationStatus: migrationStatusUncap2 } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_UNCAP_2
    );
    expect(tubesForUncap2).to.deep.equal([]);
    expect(migrationStatusUncap2).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_UNCAP_2,
        targetProfileName: 'Profil cible sans capage ET avec instructions multiforme',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message: 'Une feuille d\'instructions "multiforme" existe pour ce profil cible.',
      })
    );

    const { tubes: tubesForUniformCap, migrationStatus: migrationStatusUniformCap } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_UNIFORM_CAP
    );
    expect(tubesForUniformCap).to.deep.contain({ tubeId: tubeIdCodageEmblematique, level: 6 });
    expect(tubesForUniformCap).to.deep.contain({ tubeId: tubeIdTerminal, level: 6 });
    expect(tubesForUniformCap).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: 6 });
    expect(tubesForUniformCap).to.deep.contain({ tubeId: tubeIdPartageDroits, level: 6 });
    expect(migrationStatusUniformCap).to.equal('UNIFORM_CAP');

    const { tubes: tubesForMultiformCap1, migrationStatus: migrationStatusMultiformCap } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_1);
    expect(tubesForMultiformCap1).to.deep.contain({ tubeId: tubeIdCodageEmblematique, level: 1 });
    expect(tubesForMultiformCap1).to.deep.contain({ tubeId: tubeIdTerminal, level: 2 });
    expect(tubesForMultiformCap1).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: 3 });
    expect(tubesForMultiformCap1).to.deep.contain({ tubeId: tubeIdPartageDroits, level: 1 });
    expect(migrationStatusMultiformCap).to.equal('MULTIFORM_CAP');

    const { tubes: tubesForMultiformCap2, migrationStatus: migrationStatusMultiformCap2 } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_2);
    expect(tubesForMultiformCap2).to.deep.equal([]);
    expect(migrationStatusMultiformCap2).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP_2,
        targetProfileName: 'Profil cible avec capage multiforme 2',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message: "Les sujets suivants n'existent pas : @nimp",
      })
    );

    const { tubes: tubesForMultiformCap3, migrationStatus: migrationStatusMultiformCap3 } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_3);
    expect(tubesForMultiformCap3).to.deep.equal([]);
    expect(migrationStatusMultiformCap3).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP_3,
        targetProfileName: 'Profil cible avec capage multiforme 3',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message:
          'Les sujets suivants sont présents dans le profil cible mais pas dans les instructions : @partageDroits',
      })
    );

    const { tubes: tubesForMultiformCap4, migrationStatus: migrationStatusMultiformCap4 } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_4);
    expect(tubesForMultiformCap4).to.deep.equal([]);
    expect(migrationStatusMultiformCap4).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP_4,
        targetProfileName: 'Profil cible avec capage multiforme 4',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message:
          'Les sujets suivants sont présents dans les instructions mais pas dans le profil cible : @partageDroits',
      })
    );

    const { tubes: tubesForMultiformCap5, migrationStatus: migrationStatusMultiformCap5 } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_5);
    expect(tubesForMultiformCap5).to.deep.equal([]);
    expect(migrationStatusMultiformCap5).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP_5,
        targetProfileName: 'Profil cible avec capage multiforme 5',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message: 'Le niveau pour le sujet @codageEmblématique est invalide : "MAX"',
      })
    );

    const { tubes: tubesForMultiformCap6, migrationStatus: migrationStatusMultiformCap6 } =
      await _getTubesAndMigrationStatus(TARGET_PROFILE_ID_MULTIFORM_CAP_6);
    expect(tubesForMultiformCap6).to.deep.equal([]);
    expect(migrationStatusMultiformCap6).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith(
      {
        targetProfileId: TARGET_PROFILE_ID_MULTIFORM_CAP_6,
        targetProfileName: 'Profil cible avec capage multiforme vide',
      },
      "Erreur lors de la migration d'un profil cible: %s",
      sinon.match({
        message: 'Profil cible cappé multiforme sans instructions',
      })
    );

    const { tubes: tubesForUncapSup, migrationStatus: migrationStatusUncapSup } = await _getTubesAndMigrationStatus(
      TARGET_PROFILE_ID_UNCAP_SUP
    );
    expect(tubesForUncapSup).to.deep.contain({ tubeId: tubeIdCodageEmblematique, level: 8 });
    expect(tubesForUncapSup).to.deep.contain({ tubeId: tubeIdTerminal, level: 8 });
    expect(tubesForUncapSup).to.deep.contain({ tubeId: tubeIdEditerDocEnLigne, level: 8 });
    expect(tubesForUncapSup).to.deep.contain({ tubeId: tubeIdPartageDroits, level: 8 });
    expect(migrationStatusUncapSup).to.equal('UNCAP');
  });
});

async function _getTubesAndMigrationStatus(targetProfileId) {
  const tubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', targetProfileId)
    .orderBy('tubeId', 'ASC');
  const { migrationStatus } = await knex('target-profiles')
    .select({ migrationStatus: 'migration_status' })
    .where({ id: targetProfileId })
    .first();
  return { tubes, migrationStatus };
}

function _buildTargetProfileWithAllSkills(id, skills) {
  databaseBuilder.factory.buildTargetProfile({ id, migration_status: 'NOT_MIGRATED' });
  skills.forEach((skill) =>
    databaseBuilder.factory.buildTargetProfileSkill({
      targetProfileId: id,
      skillId: skill.id,
    })
  );
}

function _mockLearningContent() {
  const learningContent = {
    skills: [],
    tubes: [],
  };
  learningContent.tubes.push({
    id: tubeIdCodageEmblematique,
    name: '@codageEmblématique',
  });
  for (const [level, id] of Object.entries(skillIdsCodageEmblematique)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdCodageEmblematique,
      level,
    });
  }
  learningContent.tubes.push({
    id: tubeIdTerminal,
    name: '@terminal',
  });
  for (const [level, id] of Object.entries(skillIdsTerminal)) {
    learningContent.skills.push({
      id,
      name: `${id}_name`,
      tubeId: tubeIdTerminal,
      level,
    });
  }
  learningContent.tubes.push({
    id: tubeIdEditerDocEnLigne,
    name: '@editerDocEnLigne',
  });
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
