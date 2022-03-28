const _ = require('lodash');
const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Integration | Repository | challenge-repository', function () {
  describe('#get', function () {
    it('should return the challenge with skill', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge = domainBuilder.buildChallenge({ id: 'recChallenge1', skill });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...challenge, skillId: 'recSkill1', alpha: 0, delta: 0, focusable: false }],
      };

      mockLearningContent(learningContent);

      // when
      const actualChallenge = await challengeRepository.get(challenge.id);

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(challenge, 'validator'));
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

  describe('#findValidated', function () {
    it('should return only validated challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({ skill, status: 'validé' });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skill, status: 'PAS validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
        skills: [{ ...skill, status: 'actif' }],
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
          { ...skill, status: 'actif' },
          { ...anotherSkill, status: 'actif' },
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
        skills: [{ ...skill, status: 'actif' }],
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

  describe('#findFlashCompatible', function () {
    it('should return only flash compatible challenges with skills', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const flashCompatibleChallenge = domainBuilder.buildChallenge({
        skill,
        status: 'validé',
        locales: ['fr-fr'],
      });
      const nonFlashCompatibleChallenge = domainBuilder.buildChallenge({ skill, status: 'PAS validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...flashCompatibleChallenge, skillId: 'recSkill1', alpha: 3.57, delta: -8.99 },
          { ...nonFlashCompatibleChallenge, skillId: 'recSkill1' },
        ],
      };
      mockLearningContent(learningContent);
      const locale = 'fr-fr';

      // when
      const actualChallenges = await challengeRepository.findFlashCompatible(locale);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });
  });

  describe('#findValidatedBySkillId', function () {
    it('should return validated challenges of a skill', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge1 = domainBuilder.buildChallenge({
        id: 'recChallenge1',
        skill,
        status: 'validé',
      });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recChallenge2', skill, status: 'archivé' });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recChallenge3', skill, status: 'périmé' });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...challenge1, skillId: 'recSkill1', alpha: 0, delta: 0, focusable: false },
          { ...challenge2, skillId: 'recSkill1' },
          { ...challenge3, skillId: 'recSkill1' },
        ],
      };

      mockLearningContent(learningContent);

      // when
      const validatedChallenges = await challengeRepository.findValidatedBySkillId(skill.id);

      // then
      expect(validatedChallenges).to.have.lengthOf(1);
      expect(validatedChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(validatedChallenges[0], 'validator')).to.deep.equal(_.omit(challenge1, 'validator'));
    });
  });

  describe('#findValidatedPrototypeBySkillId', function () {
    it('should return validated prototype challenges of a skill', async function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge1 = domainBuilder.buildChallenge({
        id: 'recChallenge1',
        skill,
        status: 'validé',
        genealogy: 'Prototype 1',
      });
      const challenge2 = domainBuilder.buildChallenge({
        id: 'recChallenge2',
        skill,
        status: 'archivé',
        genealogy: 'Declinaison 1',
      });
      const challenge3 = domainBuilder.buildChallenge({
        id: 'recChallenge3',
        skill,
        status: 'périmé',
        genealogy: 'Declinaison 1',
      });
      const challenge4 = domainBuilder.buildChallenge({
        id: 'recChallenge1',
        skill,
        status: 'validé',
        genealogy: 'Declinaison 1',
      });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...challenge1, skillId: 'recSkill1', alpha: 0, delta: 0, focusable: false },
          { ...challenge2, skillId: 'recSkill1' },
          { ...challenge3, skillId: 'recSkill1' },
          { ...challenge4, skillId: 'recSkill1' },
        ],
      };

      mockLearningContent(learningContent);

      // when
      const validatedChallenges = await challengeRepository.findValidatedPrototypeBySkillId(skill.id);

      // then
      expect(validatedChallenges).to.have.lengthOf(1);
      expect(validatedChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(validatedChallenges[0], 'validator')).to.deep.equal(_.omit(challenge1, 'validator'));
    });
  });
});
