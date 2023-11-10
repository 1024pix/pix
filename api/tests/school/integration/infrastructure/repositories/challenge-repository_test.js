import _ from 'lodash';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../../test-helper.js';
import { Challenge } from '../../../../../lib/domain/models/Challenge.js';
import { Validator } from '../../../../../lib/domain/models/Validator.js';
import * as challengeRepository from '../../../../../src/school/infrastructure/repositories/challenge-repository.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('School | Integration | Repository | challenge-repository', function () {
  describe('#getChallengeFor1d', function () {
    it('should return an error when the mission is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TUTORIAL;

      mockLearningContent({
        tubes: [],
      });

      // when
      const error = await catchErr(challengeRepository.getChallengeFor1d)({
        missionId,
        activityLevel,
        challengeNumber: 1,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal("Aucune mission trouvée pour l'identifiant : recCHAL1");
    });
    it('should return an error when the skill associated to the challenge is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const tubeId = 'tubeId';
      const tube = learningContentBuilder.buildTube({ id: tubeId, thematicId: missionId, name: '@rechercher_di' });
      const skill = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_di1', tubeId });

      mockLearningContent({
        skills: [skill],
        tubes: [tube],
      });

      // when
      const error = await catchErr(challengeRepository.getChallengeFor1d)({
        missionId,
        activityLevel,
        challengeNumber: 1,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        'Aucun acquis trouvé pour la mission : recCHAL1, le niveau TRAINING et le numéro 1',
      );
    });
    it('should return an error when the challenge is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TUTORIAL;
      const tubeId = 'tubeId';
      const tube = learningContentBuilder.buildTube({ id: tubeId, thematicId: missionId, name: '@rechercher_di' });
      const skill = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_di1', tubeId });
      const challenge = learningContentBuilder.buildChallenge({
        id: 'recChallenge1',
        name: '@rechercher_di1',
        tubeId,
        skill: { id: 'otherSkillId' },
      });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
        tubes: [tube],
      };

      mockLearningContent(learningContent);

      // when
      const error = await catchErr(challengeRepository.getChallengeFor1d)({
        missionId,
        activityLevel,
        challengeNumber: 1,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        'Aucun challenge trouvé pour la mission : recCHAL1, le niveau TUTORIAL et le numéro 1',
      );
    });
    it('should return the challenge with the correct activityLevel', async function () {
      //given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const activiteDidacticiel = learningContentBuilder.buildTube({
        id: 'activiteDidacticielId',
        thematicId: missionId,
        name: '@rechercher_di',
      });
      const activiteEntrainement = learningContentBuilder.buildTube({
        id: 'activiteEntrainementId',
        thematicId: missionId,
        name: '@rechercher_en',
      });
      const acquisDidacticiel = learningContentBuilder.buildSkill({
        id: 'recSkill1',
        name: '@rechercher_di1',
        tubeId: activiteDidacticiel.id,
      });
      const acquisEntrainement = learningContentBuilder.buildSkill({
        id: 'recSkill2',
        name: '@rechercher_en1',
        tubeId: activiteEntrainement.id,
      });

      const epreuveDidacticiel = learningContentBuilder.buildChallenge({
        id: 'challengeId1',
        skillId: acquisDidacticiel,
      });
      const epreuveEntrainement = learningContentBuilder.buildChallenge({
        id: 'challengeId2',
        skillId: acquisEntrainement.id,
      });

      const learningContent = {
        tubes: [activiteDidacticiel, activiteEntrainement],
        challenges: [epreuveDidacticiel, epreuveEntrainement],
        skills: [acquisDidacticiel, acquisEntrainement],
      };

      mockLearningContent(learningContent);

      const expectedChallenge = _buildSchoolChallenge({ id: epreuveEntrainement.id });

      // when
      const challenges = await challengeRepository.getChallengeFor1d({ missionId, activityLevel, challengeNumber: 1 });

      // then
      expect(challenges.length).to.equal(1);
      expect(challenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(challenges[0], ['validator'])).to.deep.equal(_.omit(expectedChallenge, ['validator']));
    });
    it('should return the challenge for the given missionId', async function () {
      //given
      const missionId = 'recCHAL1';
      const otherMissionId = 'recOTMI1';
      const activityLevel = Activity.levels.TRAINING;

      const activiteEntrainement = learningContentBuilder.buildTube({
        id: 'activiteEntrainementId',
        thematicId: missionId,
        name: '@rechercher_en',
      });
      const activiteEntrainementAutreMission = learningContentBuilder.buildTube({
        id: 'activiteEntrainementId',
        thematicId: otherMissionId,
        name: '@rechercher_en',
      });
      const acquisEntrainementAutreMission = learningContentBuilder.buildSkill({
        id: 'recSkill1',
        name: '@rechercher_di1',
        tubeId: activiteEntrainementAutreMission.id,
      });
      const acquisEntrainement = learningContentBuilder.buildSkill({
        id: 'recSkill2',
        name: '@rechercher_en1',
        tubeId: activiteEntrainement.id,
      });

      const epreuveEntrainementAutreMission = learningContentBuilder.buildChallenge({
        id: 'challengeId1',
        skillId: acquisEntrainementAutreMission.id,
      });
      const epreuveEntrainement = learningContentBuilder.buildChallenge({
        id: 'challengeId2',
        skillId: acquisEntrainement.id,
      });

      const learningContent = {
        tubes: [activiteEntrainementAutreMission, activiteEntrainement],
        challenges: [epreuveEntrainementAutreMission, epreuveEntrainement],
        skills: [acquisEntrainementAutreMission, acquisEntrainement],
      };

      mockLearningContent(learningContent);

      const expectedChallenge = _buildSchoolChallenge({ id: epreuveEntrainement.id });

      // when
      const challenges = await challengeRepository.getChallengeFor1d({ missionId, activityLevel, challengeNumber: 1 });

      // then
      expect(challenges.length).to.equal(1);
      expect(_.omit(challenges[0], ['validator'])).to.deep.equal(_.omit(expectedChallenge, ['validator']));
    });
    it('should return the correct validator for the challenge type', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TUTORIAL;
      const tubeId = 'tubeId';
      const tube = learningContentBuilder.buildTube({ id: tubeId, thematicId: missionId, name: '@rechercher_di' });
      const skill = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_di1', tubeId });

      const challenge = learningContentBuilder.buildChallenge({ id: 'challengeId', skillId: skill.id });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
        tubes: [tube],
      };

      mockLearningContent(learningContent);

      _buildSchoolChallenge({ id: challenge.id, type: challenge.type });

      // when
      const challenges = await challengeRepository.getChallengeFor1d({ missionId, activityLevel, challengeNumber: 1 });

      // then
      expect(challenges[0].validator).to.be.instanceOf(Validator);
      expect(challenges[0].validator.solution.id).to.equal(challenge.id);
      expect(challenges[0].validator.solution.type).to.equal(challenge.type);
      expect(challenges[0].validator.solution.value).to.equal(challenge.solution);
    });
  });

  describe('#getActivitiyChallengesFor1d', function () {
    it('should return an error when the mission is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TUTORIAL;

      mockLearningContent({
        tubes: [],
      });

      // when
      const error = await catchErr(challengeRepository.getActivityChallengesFor1d)({
        missionId,
        activityLevel,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal("Aucune mission trouvée pour l'identifiant : recCHAL1");
    });
    it('should return an error when the tube associated to the activity level is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const skill = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_di1', tubeId: 'tubeId' });
      const otherLevelTube = learningContentBuilder.buildTube({
        id: 'otherTubeId',
        thematicId: missionId,
        name: '@rechercher_va',
      });

      mockLearningContent({
        skills: [skill],
        tubes: [otherLevelTube],
      });

      // when
      const error = await catchErr(challengeRepository.getActivityChallengesFor1d)({
        missionId,
        activityLevel,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Aucune activité trouvée pour la mission : recCHAL1 et le niveau TRAINING');
    });
    it('should return an error when one of the skill associated to the activity does not contain any challenge', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const skill1 = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_en1', tubeId: 'tubeId' });
      const skill2 = learningContentBuilder.buildSkill({ id: 'recSkill2', name: '@rechercher_en2', tubeId: 'tubeId' });
      const levelTube = learningContentBuilder.buildTube({
        id: 'tubeId',
        thematicId: missionId,
        name: '@rechercher_en',
      });
      const challenge = learningContentBuilder.buildChallenge({ skillId: skill1.id });
      mockLearningContent({
        skills: [skill1, skill2],
        tubes: [levelTube],
        challenges: [challenge],
      });

      // when
      const error = await catchErr(challengeRepository.getActivityChallengesFor1d)({
        missionId,
        activityLevel,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        "Aucun challenge trouvé pour la mission : recCHAL1, l'acquis : recSkill2 et le niveau : TRAINING",
      );
    });
    it('should return the challenges of the activity ', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const skill1 = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_en1', tubeId: 'tubeId' });
      const skill2 = learningContentBuilder.buildSkill({ id: 'recSkill2', name: '@rechercher_en2', tubeId: 'tubeId' });
      const tube = learningContentBuilder.buildTube({ id: 'tubeId', thematicId: missionId, name: '@rechercher_en' });
      const challenge1 = learningContentBuilder.buildChallenge({ id: 'challengeId', skillId: skill1.id });
      const challenge2 = learningContentBuilder.buildChallenge({ id: 'challengeId2', skillId: skill2.id });

      mockLearningContent({
        skills: [skill1, skill2],
        challenges: [challenge1, challenge2],
        tubes: [tube],
      });

      // when
      const challenges = await challengeRepository.getActivityChallengesFor1d({ missionId, activityLevel });

      // then
      const expectedChallenge1 = _buildSchoolChallenge({ id: challenge1.id, skill: null });
      const expectedChallenge2 = _buildSchoolChallenge({ id: challenge2.id, skill: null });

      expect(challenges).to.have.lengthOf(2);
      expect(challenges[0]).to.have.lengthOf(1);
      expect(_.omit(challenges[0][0], ['validator'])).to.deep.equal(_.omit(expectedChallenge1, ['validator']));
      expect(challenges[1]).to.have.lengthOf(1);
      expect(_.omit(challenges[1][0], ['validator'])).to.deep.equal(_.omit(expectedChallenge2, ['validator']));
    });
    it('should return the challenges of the activity with alternatives', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = Activity.levels.TRAINING;
      const skill = learningContentBuilder.buildSkill({ id: 'recSkill1', name: '@rechercher_en1', tubeId: 'tubeId' });
      const tube = learningContentBuilder.buildTube({ id: 'tubeId', thematicId: missionId, name: '@rechercher_en' });
      const challenge = learningContentBuilder.buildChallenge({ id: 'challengeId', skillId: skill.id });
      const challengeAlternative = learningContentBuilder.buildChallenge({ id: 'challengeId2', skillId: skill.id });

      mockLearningContent({
        skills: [skill],
        challenges: [challenge, challengeAlternative],
        tubes: [tube],
      });

      // when
      const challenges = await challengeRepository.getActivityChallengesFor1d({ missionId, activityLevel });

      // then
      const expectedChallenge = _buildSchoolChallenge({ id: challenge.id, skill: null });
      const expectedChallengeAlternative = _buildSchoolChallenge({
        id: challengeAlternative.id,
        skill: null,
      });

      expect(challenges).to.have.lengthOf(1);
      expect(challenges[0]).to.have.lengthOf(2);
      expect(_.omit(challenges[0][0], ['validator'])).to.deep.equal(_.omit(expectedChallenge, ['validator']));
      expect(_.omit(challenges[0][1], ['validator'])).to.deep.equal(
        _.omit(expectedChallengeAlternative, ['validator']),
      );
    });
  });
});

const _buildSchoolChallenge = function (challenge) {
  return domainBuilder.buildChallenge.ofSchool(challenge);
};
