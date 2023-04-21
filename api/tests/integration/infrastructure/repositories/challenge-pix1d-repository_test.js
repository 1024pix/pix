const _ = require('lodash');
const { expect, mockLearningContent, domainBuilder, catchErr } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const challengePix1dRepository = require('../../../../lib/infrastructure/repositories/challenge-pix1d-repository');
const Validator = require('../../../../lib/domain/models/Validator');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | challenge-pix1d-repository', function () {
  describe('#get', function () {
    it('should return an error when the challenge is not found', async function () {
      // given
      const answerLength = 0;
      const missionId = 'recCHAL1';
      const activityLevel = 'didacticiel';
      const tubeId = 'tubeId';
      const tube = _buildTube({ id: tubeId, missionId, name: '@rechercher_didacticiel' });
      const skill = _buildSkill({ id: 'recSkill1', name: '@rechercher_didacticiel1', tubeId });
      const challenge = _buildChallenge({
        id: 'recSkill1',
        name: '@rechercher_didacticiel1',
        tubeId,
        skillId: 'otherSkillId',
      });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
        tubes: [tube],
      };

      mockLearningContent(learningContent);

      // when
      const error = await catchErr(challengePix1dRepository.get)({
        missionId,
        activityLevel,
        answerLength,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
    it('should return the challenge with the correct activityLevel', async function () {
      //given
      const missionId = 'recCHAL1';
      const answerLength = 0;
      const activityLevel = 'entrainement';
      const activiteDidacticiel = _buildTube({
        id: 'activiteDidacticielId',
        missionId,
        name: '@rechercher_didacticiel',
      });
      const activiteEntrainement = _buildTube({
        id: 'activiteEntrainementId',
        missionId,
        name: '@rechercher_entrainement',
      });
      const acquisDidacticiel = _buildSkill({
        id: 'recSkill1',
        name: '@rechercher_didacticiel1',
        tubeId: activiteDidacticiel.id,
      });
      const acquisEntrainement = _buildSkill({
        id: 'recSkill2',
        name: '@rechercher_entrainement1',
        tubeId: activiteEntrainement.id,
      });

      const epreuveDidacticiel = _buildChallenge({ id: 'challengeId1', skillId: acquisDidacticiel.id });
      const epreuveEntrainement = _buildChallenge({ id: 'challengeId2', skillId: acquisEntrainement.id });

      const learningContent = {
        tubes: [activiteDidacticiel, activiteEntrainement],
        challenges: [epreuveDidacticiel, epreuveEntrainement],
        skills: [acquisDidacticiel, acquisEntrainement],
      };

      mockLearningContent(learningContent);

      const expectedChallenge = {
        ...domainBuilder.buildChallenge({ id: epreuveEntrainement.id }),
        skill: undefined,
      };

      // when
      const actualChallenge = await challengePix1dRepository.get({
        missionId,
        activityLevel,
        answerLength,
      });

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(expectedChallenge, 'validator'));
    });
    it('should return the challenge for the given missionId', async function () {
      //given
      const missionId = 'recCHAL1';
      const otherMissionId = 'recOTMI1';
      const activityLevel = 'entrainement';
      const answerLength = 0;

      const activiteEntrainement = _buildTube({
        id: 'activiteEntrainementId',
        missionId,
        name: '@rechercher_entrainement',
      });
      const activiteEntrainementAutreMission = _buildTube({
        id: 'activiteEntrainementId',
        missionId: otherMissionId,
        name: '@rechercher_entrainement',
      });
      const acquisEntrainementAutreMission = _buildSkill({
        id: 'recSkill1',
        name: '@rechercher_didacticiel1',
        tubeId: activiteEntrainementAutreMission.id,
      });
      const acquisEntrainement = _buildSkill({
        id: 'recSkill2',
        name: '@rechercher_entrainement1',
        tubeId: activiteEntrainement.id,
      });

      const epreuveEntrainementAutreMission = _buildChallenge({
        id: 'challengeId1',
        skillId: acquisEntrainementAutreMission.id,
      });
      const epreuveEntrainement = _buildChallenge({ id: 'challengeId2', skillId: acquisEntrainement.id });

      const learningContent = {
        tubes: [activiteEntrainementAutreMission, activiteEntrainement],
        challenges: [epreuveEntrainementAutreMission, epreuveEntrainement],
        skills: [acquisEntrainementAutreMission, acquisEntrainement],
      };

      mockLearningContent(learningContent);

      const expectedChallenge = {
        ...domainBuilder.buildChallenge({ id: epreuveEntrainement.id }),
        skill: undefined,
      };

      // when
      const actualChallenge = await challengePix1dRepository.get({ missionId, activityLevel, answerLength });

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(expectedChallenge, 'validator'));
    });
    it('should return the correct validor for the challenge type', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = 'didacticiel';
      const answerLength = 0;
      const tubeId = 'tubeId';
      const tube = _buildTube({ id: tubeId, missionId, name: '@rechercher_didacticiel' });
      const skill = _buildSkill({ id: 'recSkill1', name: '@rechercher_didacticiel1', tubeId });

      const challenge = _buildChallenge({ id: 'challengeId', skillId: skill.id });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
        tubes: [tube],
      };

      mockLearningContent(learningContent);

      domainBuilder.buildChallenge({ id: challenge.id, type: challenge.type });

      // when
      const actualChallenge = await challengePix1dRepository.get({ missionId, activityLevel, answerLength });

      // then

      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(challenge.id);
      expect(actualChallenge.validator.solution.type).to.equal(challenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(challenge.solution);
    });
  });
});

function _buildSkill({ id, name, tubeId }) {
  return {
    competenceId: 'recCOMP123',
    id,
    name,
    pixValue: 3,
    tubeId: tubeId,
    tutorialIds: [],
    version: 1,
    status: 'actif',
    level: 1,
  };
}

function _buildTube({ id, name, missionId }) {
  return {
    id,
    name,
    title: 'My title',
    thematicId: missionId,
    skillIds: [],
  };
}

function _buildChallenge({ id, skillId }) {
  return {
    id,
    attachments: ['URL pièce jointe'],
    format: 'petit',
    illustrationUrl: "Une URL vers l'illustration",
    illustrationAlt: "Le texte de l'illustration",
    instruction: 'Des instructions',
    alternativeInstruction: 'Des instructions alternatives',
    proposals: 'Une proposition',
    status: 'validé',
    type: Challenge.Type.QCM,
    locales: ['fr'],
    autoReply: false,
    focusable: false,
    discriminant: 1,
    difficulty: 0,
    responsive: 'Smartphone/Tablette',
    competenceId: 'recCOMP1',
    skillId,
    alpha: 1,
    delta: 0,
  };
}
