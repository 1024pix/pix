import _ from 'lodash';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../../test-helper.js';
import { Challenge } from '../../../../../src/shared/domain/models/Challenge.js';
import { Validator } from '../../../../../lib/domain/models/Validator.js';
import * as challengeRepository from '../../../../../src/shared/infrastructure/repositories/challenge-repository.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';

const nonComparableFields = ['instruction', 'validator'];

describe('Integration | Repository | challenge-repository', function () {
  describe('#get', function () {
    it('should return the challenge with skill', async function () {
      // given
      const challengeId = 'recCHAL1';
      const skill = _buildSkill({ id: 'recSkill1' });
      const challenge = _buildChallenge({ id: challengeId, skill });

      const learningContent = {
        skills: [skill],
        challenges: [challenge],
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
      expect(_.omit(actualChallenge, nonComparableFields)).to.deep.equal(
        _.omit(expectedChallenge, nonComparableFields),
      );
      expect(actualChallenge.instruction.toString()).to.equal(expectedChallenge.instruction.toString());
    });

    it('should setup the expected validator and solution', async function () {
      // given
      const challengeId = 'recCHAL1';
      const skill = _buildSkill({ id: 'recSkill1' });
      const challenge = _buildChallenge({ id: challengeId, skill });

      const learningContent = {
        skills: [skill],
        challenges: [{ ...challenge, t1Status: 'Activé', t2Status: 'Activé', t3Status: 'Désactivé' }],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenge = await challengeRepository.get(challengeId);

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(challenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.type).to.equal(challenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(challenge.solution);
    });
  });

  describe('#getMany', function () {
    it('should return the challenges by their id and locale', async function () {
      const skill1 = _buildSkill({ id: 'recSkill1' });
      const challenge1 = _buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = _buildSkill({ id: 'recSkill2' });
      const challenge2 = _buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = _buildSkill({ id: 'recSkill3' });
      const challenge3 = _buildChallenge({ id: 'recChal3', skill: skill3 });
      const skill4 = _buildSkill({ id: 'recSkill4' });
      const challenge4 = _buildChallenge({ id: 'recChal4', skill: skill4, locales: ['en'] });

      const learningContent = {
        skills: [skill1, skill2, skill3, skill4],
        challenges: [challenge1, challenge2, challenge3, challenge4],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.getMany(['recChal1', 'recChal2', 'recChal4'], 'fr');

      // then
      const actualChallenge1 = _.find(actualChallenges, { id: 'recChal1' });
      const actualChallenge2 = _.find(actualChallenges, { id: 'recChal2' });
      expect(actualChallenges).to.have.lengthOf(2);
      expect(Boolean(actualChallenge1)).to.be.true;
      expect(Boolean(actualChallenge2)).to.be.true;
    });

    it('should throw a NotFoundError error when resource not found', async function () {
      const skill1 = _buildSkill({ id: 'recSkill1' });
      const challenge1 = _buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = _buildSkill({ id: 'recSkill2' });
      const challenge2 = _buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = _buildSkill({ id: 'recSkill3' });
      const challenge3 = _buildChallenge({ id: 'recChal3', skill: skill3 });
      const learningContent = {
        skills: [skill1, skill2, skill3],
        challenges: [challenge1, challenge2, challenge3],
      };
      mockLearningContent(learningContent);

      // when
      const error = await catchErr(challengeRepository.getMany)(['someChallengeId'], 'fr');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#list', function () {
    it('should return all the challenges', async function () {
      // given
      const skill1 = _buildSkill({ id: 'recSkill1' });
      const challenge1 = _buildChallenge({ id: 'recChal1', skill: skill1 });
      const skill2 = _buildSkill({ id: 'recSkill2' });
      const challenge2 = _buildChallenge({ id: 'recChal2', skill: skill2 });
      const skill3 = _buildSkill({ id: 'recSkill3' });
      const challenge3 = _buildChallenge({ id: 'recChal3', skill: skill3 });
      const skill4 = _buildSkill({ id: 'recSkill4' });
      const challenge4 = _buildChallenge({ id: 'recChal4', skill: skill4, locales: ['fr-fr'] });
      const learningContent = {
        skills: [skill1, skill2, skill3, skill4],
        challenges: [challenge1, challenge2, challenge3, challenge4],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.list('fr');

      // then
      const actualChallenge1 = _.find(actualChallenges, { id: 'recChal1' });
      const actualChallenge2 = _.find(actualChallenges, { id: 'recChal2' });
      const actualChallenge3 = _.find(actualChallenges, { id: 'recChal3' });
      expect(actualChallenges).to.have.lengthOf(3);
      expect(Boolean(actualChallenge1)).to.be.true;
      expect(Boolean(actualChallenge2)).to.be.true;
      expect(Boolean(actualChallenge3)).to.be.true;
    });
  });

  describe('#findValidated', function () {
    it('should return only validated challenges with skills', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const validatedChallenge = _buildChallenge({ id: 'recChal1', skill, status: 'validé' });
      const nonValidatedChallenge = _buildChallenge({ id: 'recChal2', skill, status: 'PAS validé' });
      const learningContent = {
        skills: [skill],
        challenges: [validatedChallenge, nonValidatedChallenge],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findValidated('fr');

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].id).to.equal(validatedChallenge.id);
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const validatedChallenge = _buildChallenge({ id: 'recChal1', skill });
      const learningContent = {
        skills: [skill],
        challenges: [
          {
            ...validatedChallenge,
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findValidated('fr');

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(validatedChallenge.solution);
    });
  });

  describe('#findOperative', function () {
    it('should return only french france operative challenges with skills', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const frfrOperativeChallenge = _buildChallenge({ id: 'recChal1', skill, locales: ['fr-fr'] });
      const nonFrfrOperativeChallenge = _buildChallenge({ id: 'recChal2', skill, locales: ['en'] });
      const locale = 'fr-fr';
      const learningContent = {
        skills: [skill],
        challenges: [frfrOperativeChallenge, nonFrfrOperativeChallenge],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findOperative(locale);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].id).to.equal(frfrOperativeChallenge.id);
    });
  });

  describe('#findValidatedByCompetenceId', function () {
    it('should return only validated challenges with skills', async function () {
      // given
      const competenceId = 'recCompetenceId';
      const skill1 = _buildSkill({ id: 'recSkill1', competenceId });
      const skill2 = _buildSkill({ id: 'recSkill2', competenceId: 'otherCompetence' });
      const validatedChallenge = _buildChallenge({ skill: skill1 });
      const nonValidatedChallenge = _buildChallenge({
        skill: skill1,
        status: 'PAS validé',
      });
      const notInCompetenceValidatedChallenge = _buildChallenge({ skill: skill2 });
      const learningContent = {
        skills: [skill1],
        challenges: [validatedChallenge, nonValidatedChallenge, notInCompetenceValidatedChallenge],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findValidatedByCompetenceId(competenceId, 'fr');

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].id).to.equal(validatedChallenge.id);
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const validatedChallenge = _buildChallenge({ id: 'rechChal1', skill });
      const learningContent = {
        skills: [skill],
        challenges: [
          {
            ...validatedChallenge,
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const [actualChallenge] = await challengeRepository.findValidatedByCompetenceId(
        validatedChallenge.competenceId,
        'fr',
      );

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(validatedChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.type).to.equal(validatedChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(validatedChallenge.solution);
    });
  });

  describe('#findOperativeBySkills', function () {
    it('should return only operative challenges with skills', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const anotherSkill = _buildSkill({ id: 'recAnotherSkill' });
      const operativeInSkillChallenge = _buildChallenge({ skill, status: 'archivé' });
      const nonOperativeInSkillChallenge = _buildChallenge({ skill, status: 'PAS opérative' });
      const operativeNotInSkillChallenge = _buildChallenge({ skill: anotherSkill, status: 'validé' });
      const locale = 'fr';
      const learningContent = {
        skills: [skill, anotherSkill],
        challenges: [operativeInSkillChallenge, nonOperativeInSkillChallenge, operativeNotInSkillChallenge],
      };
      mockLearningContent(learningContent);

      // when
      const actualChallenges = await challengeRepository.findOperativeBySkills([skill], locale);

      // then
      expect(actualChallenges).to.have.lengthOf(1);
      expect(actualChallenges[0]).to.be.instanceOf(Challenge);
      expect(actualChallenges[0].id).to.equal(operativeInSkillChallenge.id);
    });

    it('should setup the expected validator and solution on found challenges', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const operativeChallenge = _buildChallenge({ skill });
      const locale = 'fr';
      const learningContent = {
        skills: [skill],
        challenges: [
          {
            ...operativeChallenge,
            t1Status: 'Activé',
            t2Status: 'Activé',
            t3Status: 'Désactivé',
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const [actualChallenge] = await challengeRepository.findOperativeBySkills([skill], locale);

      // then
      expect(actualChallenge.validator).to.be.instanceOf(Validator);
      expect(actualChallenge.validator.solution.id).to.equal(operativeChallenge.id);
      expect(actualChallenge.validator.solution.isT1Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT2Enabled).to.equal(true);
      expect(actualChallenge.validator.solution.isT3Enabled).to.equal(false);
      expect(actualChallenge.validator.solution.type).to.equal(operativeChallenge.type);
      expect(actualChallenge.validator.solution.value).to.equal(operativeChallenge.solution);
    });
  });

  describe('#findFlashCompatible', function () {
    beforeEach(function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const locales = ['fr-fr'];
      const activeChallenge = _buildChallenge({
        id: 'activeChallenge',
        skill,
        status: 'validé',
        locales,
        alpha: 3.57,
        delta: -8.99,
      });
      const archivedChallenge = _buildChallenge({
        id: 'archivedChallenge',
        skill,
        status: 'archivé',
        locales,
        alpha: 3.2,
        delta: 1.06,
      });
      const outdatedChallenge = _buildChallenge({
        id: 'outdatedChallenge',
        skill,
        status: 'périmé',
        locales,
        alpha: 4.1,
        delta: -2.08,
      });
      const learningContent = {
        skills: [skill],
        challenges: [activeChallenge, archivedChallenge, outdatedChallenge],
      };
      mockLearningContent(learningContent);
    });

    context('without requesting obsolete challenges', function () {
      it('should return all flash compatible challenges with skills', async function () {
        // given
        const locale = 'fr-fr';

        // when
        const actualChallenges = await challengeRepository.findFlashCompatible({
          locale,
        });

        // then
        expect(actualChallenges).to.have.lengthOf(2);
        expect(actualChallenges[0]).to.be.instanceOf(Challenge);
        expect(actualChallenges[0]).to.contain({
          id: 'activeChallenge',
        });
        expect(actualChallenges[1]).to.contain({
          id: 'archivedChallenge',
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

    context('when requesting obsolete challenges', function () {
      it('should return all flash compatible challenges with skills', async function () {
        // given
        const locale = 'fr-fr';

        // when
        const actualChallenges = await challengeRepository.findFlashCompatible({
          locale,
          useObsoleteChallenges: true,
        });

        // then
        expect(actualChallenges).to.have.lengthOf(3);
        expect(actualChallenges[0]).to.be.instanceOf(Challenge);
        expect(actualChallenges[0]).to.contain({
          id: 'activeChallenge',
        });
        expect(actualChallenges[1]).to.contain({
          id: 'archivedChallenge',
        });
        expect(actualChallenges[2]).to.contain({
          id: 'outdatedChallenge',
        });
      });
    });
  });

  describe('#findActiveFlashCompatible', function () {
    beforeEach(function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });
      const locales = ['fr-fr'];
      const activeChallenge = _buildChallenge({
        id: 'activeChallenge',
        skill,
        status: 'validé',
        locales,
        alpha: 3.57,
        delta: -8.99,
      });
      const archivedChallenge = _buildChallenge({
        id: 'archivedChallenge',
        skill,
        status: 'archivé',
        locales,
      });
      const outdatedChallenge = _buildChallenge({
        id: 'outdatedChallenge',
        skill,
        status: 'périmé',
        locales,
      });
      const learningContent = {
        skills: [skill],
        challenges: [activeChallenge, archivedChallenge, outdatedChallenge],
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
      const skill = _buildSkill({ id: 'recSkill1' });
      const locales = ['fr-fr'];
      const activeChallenge = _buildChallenge({
        id: 'activeChallenge',
        skill,
        status: 'validé',
        locales,
        alpha: 3.57,
        delta: -8.99,
      });
      const archivedChallenge = _buildChallenge({
        id: 'archivedChallenge',
        skill,
        status: 'archivé',
        locales,
        alpha: 1.98723,
        delta: 5.42183,
      });
      const outdatedChallenge = _buildChallenge({
        id: 'outdatedChallenge',
        skill,
        status: 'périmé',
        locales,
      });
      const learningContent = {
        skills: [skill],
        challenges: [activeChallenge, archivedChallenge, outdatedChallenge],
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
      const validatedChallenges = await challengeRepository.findValidatedBySkillId(skill.id, 'fr');

      // then
      expect(validatedChallenges).to.have.lengthOf(1);
      expect(validatedChallenges[0]).to.be.instanceOf(Challenge);
      expect(_.omit(validatedChallenges[0], nonComparableFields)).to.deep.equal(
        _.omit(expectedValidatedChallenge, nonComparableFields),
      );
      expect(validatedChallenges[0].instruction.toString()).to.equal(expectedValidatedChallenge.instruction.toString());
    });
  });

  describe('#getManyTypes', function () {
    it('should return an object associating ids to type', async function () {
      // given
      const skill = _buildSkill({ id: 'recSkill1' });

      const challenge1 = _buildChallenge({ id: 'recChallenge1', skill, locales: ['fr'], type: 'QROC' });
      const challenge2 = _buildChallenge({ id: 'recChallenge2', skill, locales: ['fr-fr'], type: 'QCU' });
      const challenge3 = _buildChallenge({ id: 'recChallenge3', skill, locales: ['en'], type: 'QROCM-dep' });

      mockLearningContent({
        skills: [skill],
        challenges: [challenge1, challenge2, challenge3],
      });

      // when
      const challengesType = await challengeRepository.getManyTypes([
        'recChallenge1',
        'recChallenge2',
        'recChallenge3',
      ]);

      // then
      expect(challengesType).to.deep.equal({
        recChallenge1: 'QROC',
        recChallenge2: 'QCU',
        recChallenge3: 'QROCM-dep',
      });
    });
  });
});

function _buildSkill({ id, name = '@sau6', tubeId = 'recTUB123', competenceId = 'recCOMP123' }) {
  return {
    competenceId,
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

function _buildChallenge({
  id,
  skill,
  status = 'validé',
  alternativeVersion,
  type = Challenge.Type.QCM,
  alpha = 1,
  delta = 0,
  locales = ['fr'],
}) {
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
    type,
    locales,
    autoReply: false,
    answer: undefined,
    responsive: 'Smartphone/Tablette',
    competenceId: skill.competenceId,
    skillId: skill.id,
    alpha,
    delta,
    skill,
    shuffled: false,
    alternativeVersion: alternativeVersion || 1,
  };
}
