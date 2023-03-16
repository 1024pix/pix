const { expect, databaseBuilder, sinon, mockLearningContent } = require('../../../test-helper');
const { knex } = require('../../../../db/knex-database-connection');
const logger = require('../../../../lib/infrastructure/logger');

const { doJob } = require('../../../../scripts/prod/target-profile-migrations/convert-target-profiles-into-new-format');

describe('Acceptance | Scripts | convert-target-profiles-into-new-format', function () {
  it('should execute the script as expected', async function () {
    // given
    sinon.stub(logger, 'info');
    const loggerErrorStub = sinon.stub(logger, 'error');
    const targetProfileAlreadyConvertedId = 1;
    const targetProfileToConvertId = 2;
    const targetProfileConversionErrorNoSkillsId = 3;
    const targetProfileConversionErrorUnknownSkillsId = 4;
    const targetProfileConversionErrorNoCorrespondingTubeId = 5;
    const learningContent = {
      skills: [],
      tubes: [],
    };
    _buildTargetProfileAlreadyConverted(targetProfileAlreadyConvertedId);
    _buildTargetProfileToConvert(targetProfileToConvertId, learningContent);
    _buildTargetProfileConversionErrorNoSkills(targetProfileConversionErrorNoSkillsId);
    _buildTargetProfileConversionErrorUnknownSkills(targetProfileConversionErrorUnknownSkillsId, learningContent);
    _buildTargetProfileConversionErrorNoCorrespondingTube(
      targetProfileConversionErrorNoCorrespondingTubeId,
      learningContent
    );

    mockLearningContent(learningContent);
    await databaseBuilder.commit();

    // when
    await doJob(false);

    // then
    const { tubes: tubesForAlreadyConverted, migrationStatus: migrationStatusAlreadyConverted } =
      await _getTubesAndMigrationStatus(targetProfileAlreadyConvertedId);
    const { tubes: tubesForToConvert, migrationStatus: migrationStatusToConvert } = await _getTubesAndMigrationStatus(
      targetProfileToConvertId
    );
    const { tubes: tubesForErrorNoSkills, migrationStatus: migrationStatusErrorNoSkillId } =
      await _getTubesAndMigrationStatus(targetProfileConversionErrorNoSkillsId);
    const { tubes: tubesForErrorUnknownSkills, migrationStatus: migrationStatusUnknownSkills } =
      await _getTubesAndMigrationStatus(targetProfileConversionErrorUnknownSkillsId);
    const { tubes: tubesForErrorNoCorrespondingTube, migrationStatus: migrationStatusNoCorrespondingTube } =
      await _getTubesAndMigrationStatus(targetProfileConversionErrorNoCorrespondingTubeId);
    expect(tubesForAlreadyConverted).to.deep.equal([{ tubeId: 'recAlreadyConvertedTubeId', level: 9000 }]);
    expect(migrationStatusAlreadyConverted).to.equal('N/A');
    expect(tubesForToConvert).to.deep.equal([
      { tubeId: 'recTubeA', level: 3 },
      { tubeId: 'recTubeB', level: 5 },
    ]);
    expect(migrationStatusToConvert).to.equal('AUTO');
    expect(tubesForErrorNoSkills).to.deep.equal([]);
    expect(migrationStatusErrorNoSkillId).to.equal('NOT_MIGRATED');
    expect(tubesForErrorUnknownSkills).to.deep.equal([{ tubeId: 'recTubeD', level: 1 }]);
    expect(migrationStatusUnknownSkills).to.equal('AUTO');
    expect(tubesForErrorNoCorrespondingTube).to.deep.equal([]);
    expect(migrationStatusNoCorrespondingTube).to.equal('NOT_MIGRATED');
    expect(loggerErrorStub).to.have.been.calledWith("3 Echec. Raison : Error: Le profil cible n'a pas d'acquis.");
    expect(loggerErrorStub).to.have.been.calledWith(
      `5 Echec. Raison : Error: Le sujet "recSomeUnknownTube" n'existe pas dans le référentiel.`
    );
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

function _buildTargetProfileAlreadyConverted(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
  databaseBuilder.factory.buildTargetProfileTube({
    tubeId: 'recAlreadyConvertedTubeId',
    level: 9000,
    targetProfileId: id,
  });
}

function _buildTargetProfileToConvert(id, learningContent) {
  databaseBuilder.factory.buildTargetProfile({ id, migration_status: 'NOT_MIGRATED' });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkill1TubeA',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkill2TubeA',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkill3TubeA',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkill5TubeB',
    targetProfileId: id,
  });

  const skill1TubeA = {
    id: 'recSkill1TubeA',
    name: '@skill1TubeA',
    tubeId: 'recTubeA',
    level: 1,
  };
  const skill3TubeA = {
    id: 'recSkill3TubeA',
    name: '@skill3TubeA',
    tubeId: 'recTubeA',
    level: 3,
  };
  const skill2TubeA = {
    id: 'recSkill2TubeA',
    name: '@skill2TubeA',
    tubeId: 'recTubeA',
    level: 2,
  };
  const skill5TubeB = {
    id: 'recSkill5TubeB',
    name: '@skill5TubeB',
    tubeId: 'recTubeB',
    level: 5,
  };
  const skill7TubeB = {
    id: 'recSkill7TubeB',
    name: '@skill7TubeB',
    tubeId: 'recTubeB',
    level: 7,
  };
  const skill3TubeC = {
    id: 'recSkill3TubeC',
    name: '@skill3TubeC',
    tubeId: 'recTubeC',
    level: 3,
  };
  const tubeA = {
    id: 'recTubeA',
    skills: [skill1TubeA, skill3TubeA, skill2TubeA],
  };
  const tubeB = {
    id: 'recTubeB',
    skills: [skill5TubeB, skill7TubeB],
  };
  const tubeC = {
    id: 'recTubeC',
    skills: [skill3TubeC],
  };
  learningContent.skills.push(skill1TubeA, skill3TubeA, skill2TubeA, skill5TubeB, skill7TubeB, skill3TubeC);
  learningContent.tubes.push(tubeA, tubeB, tubeC);
}

function _buildTargetProfileConversionErrorNoSkills(id) {
  databaseBuilder.factory.buildTargetProfile({ id, migration_status: 'NOT_MIGRATED' });
}

function _buildTargetProfileConversionErrorUnknownSkills(id, learningContent) {
  databaseBuilder.factory.buildTargetProfile({ id, migration_status: 'NOT_MIGRATED' });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSomeUnknownSkill',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkill1TubeD',
    targetProfileId: id,
  });

  const skill1TubeD = {
    id: 'recSkill1TubeD',
    name: '@skill1TubeD',
    tubeId: 'recTubeD',
    level: 1,
  };
  const tubeD = {
    id: 'recTubeD',
    skills: [skill1TubeD],
  };
  learningContent.skills.push(skill1TubeD);
  learningContent.tubes.push(tubeD);
}

function _buildTargetProfileConversionErrorNoCorrespondingTube(id, learningContent) {
  databaseBuilder.factory.buildTargetProfile({ id, migration_status: 'NOT_MIGRATED' });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSkillWithoutTube',
    targetProfileId: id,
  });

  const skill = {
    id: 'recSkillWithoutTube',
    name: '@skillWithoutTube',
    tubeId: 'recSomeUnknownTube',
    level: 2,
  };
  learningContent.skills.push(skill);
}
