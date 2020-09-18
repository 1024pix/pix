const _ = require('lodash');
const { expect, airtableBuilder, domainBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');

describe('Integration | Repository | challenge-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {
    it('should return the challenge with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const challenge = domainBuilder.buildChallenge({ skills: [skill] });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [challenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: challenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const actualChallenge = await challengeRepository.get(challenge.id);

      // then
      expect(actualChallenge).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenge, 'validator')).to.deep.equal(_.omit(challenge, 'validator'));
    });

    it('should setup the expected validator and solution', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const challenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill] });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [challenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: challenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const actualChallenge = await challengeRepository.get(challenge.id);

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(challenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(challenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });

  describe('#findValidated', () => {
    it('should return only validated challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const validatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé' });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [validatedChallenge.id, nonValidatedChallenge.id] });
      const airtableValidatedChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: validatedChallenge });
      const airtableNonValidatedChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: nonValidatedChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableValidatedChallenge, airtableNonValidatedChallenge],
        skills: [airtableSkill],
      });

      // when
      const actualChallenges = await challengeRepository.findValidated();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const validatedChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [validatedChallenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: validatedChallenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const [actualChallenge] = await challengeRepository.findValidated();

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });

  describe('#findOperative', () => {
    it('should return only operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const operativeChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'archivé' });
      const nonOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS operative' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [operativeChallenge.id, nonOperativeChallenge.id] });
      const airtableOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: operativeChallenge });
      const airtableNonOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: nonOperativeChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableOperativeChallenge, airtableNonOperativeChallenge],
        skills: [airtableSkill],
      });

      // when
      const actualChallenges = await challengeRepository.findOperative();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const operativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [operativeChallenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: operativeChallenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const [actualChallenge] = await challengeRepository.findOperative();

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(operativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(operativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });

  describe('#findFrenchFranceOperative', () => {
    it('should return only french france operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const frfrOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], locales: ['fr-fr'] });
      const nonFrfrOperativeChallenge = domainBuilder.buildChallenge({ skills: [skill], locales: ['en'] });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [frfrOperativeChallenge.id, nonFrfrOperativeChallenge.id] });
      const airtableFrfrOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: frfrOperativeChallenge });
      const airtableFrfrNonOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: nonFrfrOperativeChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableFrfrOperativeChallenge, airtableFrfrNonOperativeChallenge],
        skills: [airtableSkill],
      });

      // when
      const actualChallenges = await challengeRepository.findFrenchFranceOperative();

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const frfrOperativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], locales: ['fr-fr'] });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [frfrOperativeChallenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: frfrOperativeChallenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const [actualChallenge] = await challengeRepository.findOperative();

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(frfrOperativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(frfrOperativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });

  describe('#findValidatedByCompetenceId', () => {
    it('should return only validated challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const competenceId = 'recCompetenceId';
      const validatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé', competenceId });
      const nonValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS validé', competenceId });
      const notInCompetenceValidatedChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [validatedChallenge.id, nonValidatedChallenge.id, notInCompetenceValidatedChallenge.id] });
      const airtableValidatedChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: validatedChallenge });
      const airtableNonValidatedChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: nonValidatedChallenge });
      const airtableNotInCompetenceChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: notInCompetenceValidatedChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableValidatedChallenge, airtableNonValidatedChallenge, airtableNotInCompetenceChallenge],
        skills: [airtableSkill],
      });

      // when
      const actualChallenges = await challengeRepository.findValidatedByCompetenceId(competenceId);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const validatedChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [validatedChallenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: validatedChallenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const [actualChallenge] = await challengeRepository.findValidatedByCompetenceId(validatedChallenge.competenceId);

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });

  describe('#findOperativeBySkills', () => {
    it('should return only operative challenges with skills', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const anotherSkill = domainBuilder.buildSkill();
      const operativeInSkillChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'archivé' });
      const nonOperativeInSkillChallenge = domainBuilder.buildChallenge({ skills: [skill], status: 'PAS opérative' });
      const operativeNotInSkillChallenge = domainBuilder.buildChallenge({ skills: [anotherSkill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [operativeInSkillChallenge.id, nonOperativeInSkillChallenge.id] });
      const airtableAnotherSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: anotherSkill, challengeIds: [operativeNotInSkillChallenge.id] });
      const airtableOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: operativeInSkillChallenge });
      const airtableNonOperativeChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: nonOperativeInSkillChallenge });
      const airtableNotInSkillChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: operativeNotInSkillChallenge });
      airtableBuilder.mockLists({
        challenges: [airtableOperativeChallenge, airtableNonOperativeChallenge, airtableNotInSkillChallenge],
        skills: [airtableSkill, airtableAnotherSkill],
      });

      // when
      const actualChallenges = await challengeRepository.findOperativeBySkills([skill]);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(actualChallenges[0], 'validator')).to.deep.equal(_.omit(actualChallenges[0], 'validator'));
    });

    it('should setup the expected validator and solution on found challenges', async () => {
      // given
      const skill = domainBuilder.buildSkill();
      const operativeChallenge = domainBuilder.buildChallenge({ type: Challenge.Type.QCM, skills: [skill], status: 'validé' });
      const airtableSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: skill, challengeIds: [operativeChallenge.id] });
      const airtableChallenge = airtableBuilder.factory.buildChallenge.fromDomain({ domainChallenge: operativeChallenge });
      airtableBuilder.mockLists({ challenges: [airtableChallenge], skills: [airtableSkill] });

      // when
      const [actualChallenge] = await challengeRepository.findOperativeBySkills([skill]);

      // then
      const isT1Enabled = airtableChallenge.fields['T1 - Espaces, casse & accents'] !== 'Désactivé';
      const isT2Enabled = airtableChallenge.fields['T2 - Ponctuation'] !== 'Désactivé';
      const isT3Enabled = airtableChallenge.fields['T3 - Distance d\'édition'] !== 'Désactivé';
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(operativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(isT1Enabled);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(isT2Enabled);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(isT3Enabled);
      expect(actualChallenge.validator.solution.scoring).to.equal(airtableChallenge.fields['Scoring']);
      expect(actualChallenge.validator.solution.type).to.equal(operativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(airtableChallenge.fields['Bonnes réponses']);
    });
  });
});
