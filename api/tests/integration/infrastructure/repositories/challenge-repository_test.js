import _ from 'lodash';
import { expect, mockLearningContent, domainBuilder, catchErr } from '../../../test-helper.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';
import { Validator } from '../../../../lib/domain/models/Validator.js';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | challenge-repository', function () {
  describe('#get', function () {
    it('should return the challenge with skill', async function () {
      // given
      const challengeId = 'recCHAL1';

      const skill = _buildSkill({ id: 'recSkill1' });

      const challenge = _buildChallenge({ id: challengeId, skill });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...challenge, skillId: 'recSkill1', alpha: 1, delta: 0 }],
      };

      mockLearningContent(learningContent);

      const expectedChallenge = domainBuilder.buildChallenge({
        ...challenge,
        focused: challenge.focusable,
        skill: domainBuilder.buildSkill({ ...skill, difficulty: skill.level }),
      });

      // when
      const actualChallenge = await challengeRepository.get(challengeId);

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(expectedChallenge, 'validator'));
    });

    it('should setup the expected validator and solution', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skill });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...challenge, skillId: 'recSkill1', t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenge = await challengeRepository.get(challenge.id);

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(challenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(challenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(challenge.solution);
    });
  });

  describe('#getForPix1D', function () {
    it('should return an error when the mission is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = 'didacticiel';

      mockLearningContent({
        tubes: [],
      });

      // when
      const error = await catchErr(challengeRepository.getForPix1D)({
        missionId,
        activityLevel,
        answerLength: 0,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal("Aucune mission trouvée pour l'identifiant : recCHAL1");
    });
    it('should return an error when the activity is not found', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = 'entrainement';
      const tubeId = 'tubeId';
      const tube = _buildTube({ id: tubeId, missionId, name: '@rechercher_didacticiel' });
      const skill = _buildSkill({ id: 'recSkill1', name: '@rechercher_didacticiel1', tubeId });

      mockLearningContent({
        skills: [skill],
        tubes: [tube],
      });

      // when
      const error = await catchErr(challengeRepository.getForPix1D)({
        missionId,
        activityLevel,
        answerLength: 0,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Aucune activité trouvée pour la mission : recCHAL1 et le niveau entrainement');
    });
    it('should return an error when the challenge is not found', async function () {
      // given
      const answerLength = 0;
      const missionId = 'recCHAL1';
      const activityLevel = 'didacticiel';
      const tubeId = 'tubeId';
      const tube = _buildTube({ id: tubeId, missionId, name: '@rechercher_didacticiel' });
      const skill = _buildSkill({ id: 'recSkill1', name: '@rechercher_didacticiel1', tubeId });
      const challenge = _buildChallenge({
        id: 'recChallenge1',
        name: '@rechercher_didacticiel1',
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
      const error = await catchErr(challengeRepository.getForPix1D)({
        missionId,
        activityLevel,
        answerLength,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        'Aucune activité trouvée pour la mission : recCHAL1, le niveau didacticiel et le numéro 1'
      );
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

      const epreuveDidacticiel = _buildChallenge({ id: 'challengeId1', skill: { id: acquisDidacticiel.id } });
      const epreuveEntrainement = _buildChallenge({ id: 'challengeId2', skill: { id: acquisEntrainement.id } });

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
      const actualChallenge = await challengeRepository.getForPix1D({
        missionId,
        activityLevel,
        answerLength,
      });

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, ['validator', 'skill', 'focused', 'timer'])).to.deep.equal(
        _.omit(expectedChallenge, ['validator', 'skill', 'focused', 'timer'])
      );
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
        skill: { id: acquisEntrainementAutreMission.id },
      });
      const epreuveEntrainement = _buildChallenge({ id: 'challengeId2', skill: { id: acquisEntrainement.id } });

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
      const actualChallenge = await challengeRepository.getForPix1D({ missionId, activityLevel, answerLength });

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, ['validator', 'skill', 'focused', 'timer'])).to.deep.equal(
        _.omit(expectedChallenge, ['validator', 'skill', 'focused', 'timer'])
      );
    });
    it('should return the correct validor for the challenge type', async function () {
      // given
      const missionId = 'recCHAL1';
      const activityLevel = 'didacticiel';
      const answerLength = 0;
      const tubeId = 'tubeId';
      const tube = _buildTube({ id: tubeId, missionId, name: '@rechercher_didacticiel' });
      const skill = _buildSkill({ id: 'recSkill1', name: '@rechercher_didacticiel1', tubeId });

      const challenge = _buildChallenge({ id: 'challengeId', skill: { id: skill.id } });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
        tubes: [tube],
      };

      mockLearningContent(learningContent);

      domainBuilder.buildChallenge({ id: challenge.id, type: challenge.type });

      // when
      const actualChallenge = await challengeRepository.getForPix1D({ missionId, activityLevel, answerLength });

      // then

      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(challenge.id);
      expect(actualChallenge.validator.solution.type).to.equal(challenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(challenge.solution);
    });
  });

  describe('#getMany', function () {
    it('should return the challenges by their id', async function () {
      const skill1 = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = domainBuilder.buildSkill({ id: 'recSkill2' });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = domainBuilder.buildSkill({ id: 'recSkill3' });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recChal3', skill: skill3 });
      const learningContent = {
        skills: [
          { ...skill1, level: skill1.difficulty },
          { ...skill2, level: skill2.difficulty },
          { ...skill3, level: skill3.difficulty },
        ],
        challenges: [
          { ...challenge1, skillId: 'recSkill1' },
          { ...challenge2, skillId: 'recSkill2' },
          { ...challenge3, skillId: 'recSkill3' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.getMany(['recChal1', 'recChal2']);

      // then
      const actualChallenge1 = _.find(actualChallenges, { skill: skill1, id: 'recChal1' });
      const actualChallenge2 = _.find(actualChallenges, { skill: skill2, id: 'recChal2' });
      expect(actualChallenges).to.have.lengthOf(2);
      expect(Boolean(actualChallenge1)).to.be.true;
      expect(Boolean(actualChallenge2)).to.be.true;
    });

    it('should throw a NotFoundError error when resource not found', async function () {
      const skill1 = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = domainBuilder.buildSkill({ id: 'recSkill2' });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = domainBuilder.buildSkill({ id: 'recSkill3' });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recChal3', skill: skill3 });
      const learningContent = {
        skills: [
          { ...skill1, level: skill1.difficulty },
          { ...skill2, level: skill2.difficulty },
          { ...skill3, level: skill3.difficulty },
        ],
        challenges: [
          { ...challenge1, skillId: 'recSkill1' },
          { ...challenge2, skillId: 'recSkill2' },
          { ...challenge3, skillId: 'recSkill3' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const error = await catchErr(challengeRepository.getMany)(['someChallengeId']);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#list', function () {
    it('should return all the challenges', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = domainBuilder.buildSkill({ id: 'recSkill2' });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = domainBuilder.buildSkill({ id: 'recSkill3' });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recChal3', skill: skill3 });
      const learningContent = {
        skills: [
          { ...skill1, level: skill1.difficulty },
          { ...skill2, level: skill2.difficulty },
          { ...skill3, level: skill3.difficulty },
        ],
        challenges: [
          { ...challenge1, skillId: 'recSkill1' },
          { ...challenge2, skillId: 'recSkill2' },
          { ...challenge3, skillId: 'recSkill3' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.list();

      // then
      const actualChallenge1 = _.find(actualChallenges, { skill: skill1, id: 'recChal1' });
      const actualChallenge2 = _.find(actualChallenges, { skill: skill2, id: 'recChal2' });
      const actualChallenge3 = _.find(actualChallenges, { skill: skill3, id: 'recChal3' });
      expect(actualChallenges).to.have.lengthOf(3);
      expect(Boolean(actualChallenge1)).to.be.true;
      expect(Boolean(actualChallenge2)).to.be.true;
      expect(Boolean(actualChallenge3)).to.be.true;
    });
  });

  describe('#findValidated', function () {
    it('should return only validated challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({ skill, status: 'validé' });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skill, status: 'PAS validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...validatedChallenge, skillId: 'recSkill1' },
          { ...nonValidatedChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findValidated();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({
        type: Challenge.Type.QCM,
        skills: [skill],
        status: 'validé',
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          {
            ...validatedChallenge,
            skillId: 'recSkill1',
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findValidated();

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(validatedChallenge.solution);
    });
  });

  describe('#findOperative', function () {
    it('should return only operative challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({ skill, status: 'archivé' });
      const nonOperativeChallenge = domainBuilder.buildChallenge({ skill, status: 'PAS operative' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...operativeChallenge, skillId: 'recSkill1' },
          { ...nonOperativeChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findOperative();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({
        type: Challenge.Type.QCM,
        skill,
        status: 'validé',
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          {
            ...operativeChallenge,
            skillId: 'recSkill1',
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findOperative();

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(operativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(operativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(operativeChallenge.solution);
    });
  });

  describe('#findOperativeHavingLocale', function () {
    it('should return only french france operative challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const frfrOperativeChallenge = domainBuilder.buildChallenge({ skill, locales: ['fr-fr'] });
      const nonFrfrOperativeChallenge = domainBuilder.buildChallenge({ skill, locales: ['en'] });
      const locale = 'fr-fr';
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...frfrOperativeChallenge, skillId: 'recSkill1' },
          { ...nonFrfrOperativeChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findOperativeHavingLocale(locale);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });
  });

  describe('#findValidatedByCompetenceId', function () {
    it('should return only validated challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const competenceId = 'recCompetenceId';
      const validatedChallenge = domainBuilder.buildChallenge({ skill, status: 'validé', competenceId });
      const nonValidatedChallenge = domainBuilder.buildChallenge({
        skill,
        status: 'PAS validé',
        competenceId,
      });
      const notInCompetenceValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...validatedChallenge, skillId: 'recSkill1' },
          { ...nonValidatedChallenge, skillId: 'recSkill1' },
          { ...notInCompetenceValidatedChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findValidatedByCompetenceId(competenceId);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({
        type: Challenge.Type.QCM,
        skill,
        status: 'validé',
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          {
            ...validatedChallenge,
            skillId: 'recSkill1',
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const [actualChallenge] = await challengeRepository.findValidatedByCompetenceId(validatedChallenge.competenceId);

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(validatedChallenge.solution);
    });
  });

  describe('#findOperativeBySkills', function () {
    it('should return only operative challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const anotherSkill = domainBuilder.buildSkill({ id: 'recAnotherSkill' });
      const operativeInSkillChallenge = domainBuilder.buildChallenge({ skill, status: 'archivé' });
      const nonOperativeInSkillChallenge = domainBuilder.buildChallenge({ skill, status: 'PAS opérative' });
      const operativeNotInSkillChallenge = domainBuilder.buildChallenge({ skill: anotherSkill, status: 'validé' });
      const learningContent = {
        skills: [
          { ...skill, status: 'actif', level: skill.difficulty },
          { ...anotherSkill, status: 'actif', level: anotherSkill.difficulty },
        ],
        challenges: [
          { ...operativeInSkillChallenge, skillId: 'recSkill1' },
          { ...nonOperativeInSkillChallenge, skillId: 'recSkill1' },
          { ...operativeNotInSkillChallenge, skillId: 'recAnotherSkill' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findOperativeBySkills([skill]);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({
        type: Challenge.Type.QCM,
        skill,
        status: 'validé',
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          {
            ...operativeChallenge,
            skillId: 'recSkill1',
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findOperativeBySkills([skill]);

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(operativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(operativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(operativeChallenge.solution);
    });
  });

  describe('#findActiveFlashCompatible', function () {
    beforeEach(function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const locales = ['fr-fr'];
      const activeChallenge = domainBuilder.buildChallenge({
        id: 'activeChallenge',
        skill,
        status: 'validé',
        locales,
      });
      const archivedChallenge = domainBuilder.buildChallenge({
        id: 'archivedChallenge',
        skill,
        status: 'archivé',
        locales,
      });
      const outdatedChallenge = domainBuilder.buildChallenge({
        id: 'outdatedChallenge',
        skill,
        status: 'périmé',
        locales,
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...activeChallenge, skillId: 'recSkill1', alpha: 3.57, delta: -8.99 },
          { ...archivedChallenge, skillId: 'recSkill1' },
          { ...outdatedChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('should return only flash compatible challenges with skills', async function () {
      // given
      const locale = 'fr-fr';
      const successProbabilityThreshold = 0.95;

      // when
      const actualChallenges = await challengeRepository.findActiveFlashCompatible({
        locale,
        successProbabilityThreshold,
      });

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0]).to.deep.contain({
        id: 'activeChallenge',
        status: 'validé',
        locales: ['fr-fr'],
        difficulty: -8.99,
        discriminant: 3.57,
        minimumCapability: -8.165227176704079,
      });
      expect(actualChallenges[0].skill).to.contain({
        id: 'recSkill1',
      });
    });

    it('should allow overriding success probability threshold default value', async function () {
      // given
      const successProbabilityThreshold = 0.75;

      // when
      const actualChallenges = await challengeRepository.findActiveFlashCompatible({
        locale: 'fr-fr',
        successProbabilityThreshold,
      });

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].minimumCapability).to.equal(-8.682265465359073);
    });
  });

  describe('#findOperativeFlashCompatible', function () {
    beforeEach(function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const locales = ['fr-fr'];
      const activeChallenge = domainBuilder.buildChallenge({
        id: 'activeChallenge',
        skill,
        status: 'validé',
        locales,
      });
      const archivedChallenge = domainBuilder.buildChallenge({
        id: 'archivedChallenge',
        skill,
        status: 'archivé',
        locales,
      });
      const outdatedChallenge = domainBuilder.buildChallenge({
        id: 'outdatedChallenge',
        skill,
        status: 'périmé',
        locales,
      });
      const learningContent = {
        skills: [{ ...skill, status: 'actif', level: skill.difficulty }],
        challenges: [
          { ...activeChallenge, skillId: 'recSkill1', alpha: 3.57, delta: -8.99 },
          { ...archivedChallenge, skillId: 'recSkill1', alpha: 1.98723, delta: 5.42183 },
          { ...outdatedChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('should return only flash compatible challenges with skills', async function () {
      // given
      const locale = 'fr-fr';

      // when
      const actualChallenges = await challengeRepository.findOperativeFlashCompatible({ locale });

      // then
      expect(actualChallenges).to.have.lengthOf(2);
      expect(actualChallenges[1]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0]).to.deep.contain({
        id: 'activeChallenge',
        status: 'validé',
        locales: ['fr-fr'],
        difficulty: -8.99,
        discriminant: 3.57,
        minimumCapability: -8.165227176704079,
      });
      expect(actualChallenges[0].skill).to.contain({
        id: 'recSkill1',
      });
      expect(actualChallenges[1]).to.deep.contain({
        id: 'archivedChallenge',
        status: 'archivé',
        locales: ['fr-fr'],
        difficulty: 5.42183,
        discriminant: 1.98723,
        minimumCapability: 6.9035100164885,
      });
      expect(actualChallenges[1].skill).to.contain({
        id: 'recSkill1',
      });
    });

    it('should allow overriding success probability threshold default value', async function () {
      // given
      const successProbabilityThreshold = 0.75;

      // when
      const actualChallenges = await challengeRepository.findOperativeFlashCompatible({
        locale: 'fr-fr',
        successProbabilityThreshold,
      });

      // then
      expect(actualChallenges).to.have.lengthOf(2);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].minimumCapability).to.equal(-8.682265465359073);
      expect(actualChallenges[1].minimumCapability).to.equal(5.974666002208154);
    });
  });

  describe('#findValidatedBySkillId', function () {
    it('should return validated challenges of a skill', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });

      const challenge1 = _buildChallenge({ id: 'recChallenge1', skill });
      const challenge2 = _buildChallenge({ id: 'recChallenge2', skill, status: 'archivé' });
      const challenge3 = _buildChallenge({ id: 'recChallenge3', skill, status: 'périmé' });

      mockLearningContent({
        skills: [skill],
        challenges: [challenge1, challenge2, challenge3],
      });

      const expectedValidatedChallenge = domainBuilder.buildChallenge({
        ...challenge1,
        focused: challenge1.focusable,
        skill: domainBuilder.buildSkill({ ...skill, difficulty: skill.level }),
      });

      // when
      const validatedChallenges = await challengeRepository.findValidatedBySkillId(skill.id);

      // then
      expect(validatedChallenges).to.have.lengthOf(1);
      expect(validatedChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(validatedChallenges[0], 'validator')).to.deep.equal(
        _.omit(expectedValidatedChallenge, 'validator')
      );
    });
  });
});

function _buildSkill({ id, name = '@sau6', tubeId = 'recTUB123' }) {
  return {
    competenceId: 'recCOMP123',
    id,
    name,
    pixValue: 3,
    tubeId,
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

function _buildChallenge({ id, skill, status = 'validé' }) {
  return {
    id,
    attachments: ['URL pièce jointe'],
    format: 'petit',
    illustrationUrl: "Une URL vers l'illustration",
    illustrationAlt: "Le texte de l'illustration",
    instruction: 'Des instructions',
    alternativeInstruction: 'Des instructions alternatives',
    proposals: 'Une proposition',
    status,
    timer: '',
    focusable: true,
    type: Challenge.Type.QCM,
    locales: ['fr'],
    autoReply: false,
    discriminant: 1,
    difficulty: 0,
    answer: undefined,
    responsive: 'Smartphone/Tablette',
    competenceId: 'recCOMP1',
    skillId: skill.id,
    alpha: 1,
    delta: 0,
    skill,
    shuffled: false,
  };
}
