const _ = require('lodash');
const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Integration | Repository | challenge-repository', () => {

  describe('#get', () => {
    it('should return the challenge with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge = domainBuilder.buildChallenge({ id: 'recChallenge1', skills: [skill] });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...challenge, skillIds: ['recSkill1'] }],
      };

      mockLearningContent(learningContent);

      // when
      const actualChallenge = await challengeRepository.get(challenge.id);

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(challenge, 'validator'));
    });

    it('should setup the expected validator and solution', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const challenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill] });

      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...challenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
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

  describe('#findValidated', () => {
    it('should return only validated challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé' });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...validatedChallenge, skillIds: ['recSkill1'] },
          { ...nonValidatedChallenge, skillIds: ['recSkill1'] },
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

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...validatedChallenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
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

  describe('#findOperative', () => {
    it('should return only operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'archivé' });
      const nonOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS operative' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...operativeChallenge, skillIds: ['recSkill1'] },
          { ...nonOperativeChallenge, skillIds: ['recSkill1'] },
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

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...operativeChallenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
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

  describe('#findFrenchFranceOperative', () => {
    it('should return only french france operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const frfrOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], locales: ['fr-fr'] });
      const nonFrfrOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], locales: ['en'] });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...frfrOperativeChallenge, skillIds: ['recSkill1'] },
          { ...nonFrfrOperativeChallenge, skillIds: ['recSkill1'] },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findFrenchFranceOperative();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const frfrOperativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], locales: ['fr-fr'] });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...frfrOperativeChallenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findOperative();

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(frfrOperativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.scoring).to.equal('');
      expect(actualChallenge.validator.solution.type).to.equal(frfrOperativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(frfrOperativeChallenge.solution);
    });
  });

  describe('#findValidatedByCompetenceId', () => {
    it('should return only validated challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const competenceId = 'recCompetenceId';
      const validatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé', competenceId });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS validé', competenceId });
      const notInCompetenceValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [
          { ...validatedChallenge, skillIds: ['recSkill1'] },
          { ...nonValidatedChallenge, skillIds: ['recSkill1'] },
          { ...notInCompetenceValidatedChallenge, skillIds: ['recSkill1'] },
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

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const validatedChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...validatedChallenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
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

  describe('#findOperativeBySkills', () => {
    it('should return only operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const anotherSkill = domainBuilder.buildSkill({ id: 'recAnotherSkill' });
      const operativeInSkillChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'archivé' });
      const nonOperativeInSkillChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS opérative' });
      const operativeNotInSkillChallenge = domainBuilder.buildChallenge({ skills: [anotherSkill], status: 'validé' });
      const learningContent = {
        skills: [
          { ...skill, status: 'actif' },
          { ...anotherSkill, status: 'actif' },
        ],
        challenges: [
          { ...operativeInSkillChallenge, skillIds: ['recSkill1'] },
          { ...nonOperativeInSkillChallenge, skillIds: ['recSkill1'] },
          { ...operativeNotInSkillChallenge, skillIds: ['recAnotherSkill'] },
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

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
      const operativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const learningContent = {
        skills: [{ ...skill, status: 'actif' }],
        challenges: [{ ...operativeChallenge, skillIds: ['recSkill1'], t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
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
});
