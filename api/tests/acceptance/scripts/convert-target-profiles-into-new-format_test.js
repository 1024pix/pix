const { expect, databaseBuilder, sinon, LearningContentMock } = require('../../test-helper');
const { knex } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');

const { doJob } = require('../../../scripts/prod/convert-target-profiles-into-new-format');

describe('Acceptance | Scripts | convert-target-profiles-into-new-format', function () {
  it('should execute the script as expected', async function () {
    // given
    sinon.stub(logger, 'info');
    const loggerErrorStub = sinon.stub(logger, 'error');
    const targetProfileAlreadyConvertedId = 1;
    const targetProfileToConvertId = 2;
    const targetProfileConversionErrorNoSkillsId = 3;
    const targetProfileConversionErrorUnknownSkillsId = 4;
    _buildTargetProfileAlreadyConverted(targetProfileAlreadyConvertedId);
    _buildTargetProfileToConvert(targetProfileToConvertId);
    _buildTargetProfileConversionErrorNoSkills(targetProfileConversionErrorNoSkillsId);
    _buildTargetProfileConversionErrorUnknownSkills(targetProfileConversionErrorUnknownSkillsId);

    LearningContentMock.mockCommon();
    await databaseBuilder.commit();

    // when
    await doJob();

    // then
    const tubesForAlreadyConverted = await _getTubes(targetProfileAlreadyConvertedId);
    const tubesForToConvert = await _getTubes(targetProfileToConvertId);
    const tubesForErrorNoSkills = await _getTubes(targetProfileConversionErrorNoSkillsId);
    const tubesForErrorUnknownSkills = await _getTubes(targetProfileConversionErrorUnknownSkillsId);
    expect(tubesForAlreadyConverted).to.deep.equal([{ tubeId: 'recAlreadyConvertedTubeId', level: 9000 }]);
    expect(tubesForToConvert).to.deep.equal([
      { tubeId: 'tubePixA1C1Th1Tu1', level: 3 },
      { tubeId: 'tubePixA1C1Th1Tu2', level: 5 },
    ]);
    expect(tubesForErrorNoSkills).to.deep.equal([]);
    expect(tubesForErrorUnknownSkills).to.deep.equal([]);
    expect(loggerErrorStub).to.have.been.calledWith("3 Echec. Raison : Error: Le profil cible n'a pas d'acquis.");
    expect(loggerErrorStub).to.have.been.calledWith(
      `4 Echec. Raison : Error: L'acquis "recSomeUnknownSkill" n'existe pas dans le référentiel.`
    );
  });
});

async function _getTubes(targetProfileId) {
  return knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', targetProfileId)
    .orderBy('tubeId', 'ASC');
}

function _buildTargetProfileAlreadyConverted(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
  databaseBuilder.factory.buildTargetProfileTube({
    tubeId: 'recAlreadyConvertedTubeId',
    level: 9000,
    targetProfileId: id,
  });
}

function _buildTargetProfileToConvert(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'skillPixA1C1Th1Tu1S1',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'skillPixA1C1Th1Tu1S3',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'skillPixA1C1Th1Tu2S3',
    targetProfileId: id,
  });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'skillPixA1C1Th1Tu2S5',
    targetProfileId: id,
  });
}

function _buildTargetProfileConversionErrorNoSkills(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
}

function _buildTargetProfileConversionErrorUnknownSkills(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSomeUnknownSkill',
    targetProfileId: id,
  });
}
