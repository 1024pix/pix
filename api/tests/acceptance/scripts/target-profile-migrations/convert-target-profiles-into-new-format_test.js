import { expect, databaseBuilder, sinon, mockLearningContent } from '../../../test-helper';
import { knex } from '../../../../db/knex-database-connection';
import logger from '../../../../lib/infrastructure/logger';
import { doJob } from '../../../../scripts/prod/target-profile-migrations/convert-target-profiles-into-new-format';

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
    _buildTargetProfileConversionErrorUnknownSkills(targetProfileConversionErrorUnknownSkillsId);
    _buildTargetProfileConversionErrorNoCorrespondingTube(
      targetProfileConversionErrorNoCorrespondingTubeId,
      learningContent
    );

    mockLearningContent(learningContent);
    await databaseBuilder.commit();

    // when
    await doJob();

    // then
    const tubesForAlreadyConverted = await _getTubes(targetProfileAlreadyConvertedId);
    const tubesForToConvert = await _getTubes(targetProfileToConvertId);
    const tubesForErrorNoSkills = await _getTubes(targetProfileConversionErrorNoSkillsId);
    const tubesForErrorUnknownSkills = await _getTubes(targetProfileConversionErrorUnknownSkillsId);
    const tubesForErrorNoCorrespondingTube = await _getTubes(targetProfileConversionErrorNoCorrespondingTubeId);
    expect(tubesForAlreadyConverted).to.deep.equal([{ tubeId: 'recAlreadyConvertedTubeId', level: 9000 }]);
    expect(tubesForToConvert).to.deep.equal([
      { tubeId: 'recTubeA', level: 3 },
      { tubeId: 'recTubeB', level: 5 },
    ]);
    expect(tubesForErrorNoSkills).to.deep.equal([]);
    expect(tubesForErrorUnknownSkills).to.deep.equal([]);
    expect(tubesForErrorNoCorrespondingTube).to.deep.equal([]);
    expect(loggerErrorStub).to.have.been.calledWith("3 Echec. Raison : Error: Le profil cible n'a pas d'acquis.");
    expect(loggerErrorStub).to.have.been.calledWith(
      `4 Echec. Raison : Error: L'acquis "recSomeUnknownSkill" n'existe pas dans le référentiel.`
    );
    expect(loggerErrorStub).to.have.been.calledWith(
      `5 Echec. Raison : Error: Le sujet "recSomeUnknownTube" n'existe pas dans le référentiel.`
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

function _buildTargetProfileToConvert(id, learningContent) {
  databaseBuilder.factory.buildTargetProfile({ id });
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
  databaseBuilder.factory.buildTargetProfile({ id });
}

function _buildTargetProfileConversionErrorUnknownSkills(id) {
  databaseBuilder.factory.buildTargetProfile({ id });
  databaseBuilder.factory.buildTargetProfileSkill({
    skillId: 'recSomeUnknownSkill',
    targetProfileId: id,
  });
}

function _buildTargetProfileConversionErrorNoCorrespondingTube(id, learningContent) {
  databaseBuilder.factory.buildTargetProfile({ id });
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
