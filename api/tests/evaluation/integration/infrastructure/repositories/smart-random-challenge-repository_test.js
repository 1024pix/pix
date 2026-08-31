import { expect } from 'chai';

import * as smartRandomChallengeRepository from '../../../../../src/evaluation/infrastructure/repositories/smart-random-challenge-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Integration | Infrastructure| Repository | smart-random-challenge-repository', function () {
  describe('#findValidatedByCompetenceId', function () {
    context('when no challenges match the constraints', function () {
      it('returns an empty array', async function () {
        const someChallengeData = {
          id: 'challengeA',
          locales: ['en', 'es'],
          competenceId: 'competenceA',
        };
        databaseBuilder.factory.learningContent.build(
          {
            challenges: [someChallengeData],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomChallenges = await smartRandomChallengeRepository.findValidatedByCompetenceId(
          'competenceB',
          'fr',
        );

        expect(smartRandomChallenges).to.deep.equal([]);
      });
    });

    context('when some challenges match the constraints', function () {
      it('returns the smart random challenges ordered by id', async function () {
        const notMatchingChallengeData = {
          id: 'challengeNotMatching',
          locales: ['en', 'es'],
          competenceId: 'competenceA',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
        };
        const rightLocaleWrongCompetenceData = {
          id: 'challengeRightLocaleWrongCompetence',
          locales: ['fr'],
          competenceId: 'competenceA',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
        };
        const wrongLocaleRightCompetenceData = {
          id: 'challengeWrongLocaleRightCompetence',
          locales: ['es'],
          competenceId: 'competenceOK',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
        };
        const notValidatedData = {
          id: 'challengeNotValidated',
          locales: ['fr'],
          competenceId: 'competenceOK',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.ARCHIVED,
        };
        const matchingChallenge1 = {
          id: 'challengeZ',
          locales: ['fr'],
          competenceId: 'competenceOK',
          skillId: 'someSkillIdZ',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
          timer: null,
        };
        const matchingChallenge2 = {
          id: 'challengeA',
          locales: ['fr'],
          competenceId: 'competenceOK',
          skillId: 'someSkillIdA',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
          timer: 999,
        };
        databaseBuilder.factory.learningContent.build(
          {
            challenges: [
              notMatchingChallengeData,
              rightLocaleWrongCompetenceData,
              wrongLocaleRightCompetenceData,
              matchingChallenge1,
              matchingChallenge2,
              notValidatedData,
            ],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomChallenges = await smartRandomChallengeRepository.findValidatedByCompetenceId(
          'competenceOK',
          'fr',
        );

        expect(smartRandomChallenges).to.deepEqualArray([
          domainBuilder.evaluation.buildSmartRandomChallenge(matchingChallenge2),
          domainBuilder.evaluation.buildSmartRandomChallenge(matchingChallenge1),
        ]);
      });
    });
  });

  describe('#findOperativeBySkillsAndLocales', function () {
    context('when no challenges match the constraints', function () {
      it('returns an empty array', async function () {
        const someChallengeData = {
          id: 'challengeA',
          locales: ['en', 'es'],
          skillId: 'skillA',
        };
        databaseBuilder.factory.learningContent.build(
          {
            challenges: [someChallengeData],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomChallenges = await smartRandomChallengeRepository.findOperativeBySkillsAndLocales(
          [{ id: 'skillB' }],
          ['fr'],
        );

        expect(smartRandomChallenges).to.deep.equal([]);
      });
    });

    context('when some challenges match the constraints', function () {
      it('returns the smart random challenges ordered by id', async function () {
        const locales = ['fr-BE', 'fr'];
        const wrongStatusData = {
          id: 'challengeWrongStatus',
          locales: ['fr'],
          skillId: 'skillOK1',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.OBSOLETE,
        };
        const wrongLocaleData = {
          id: 'challengeWrongLocale',
          locales: ['fr-LU'],
          skillId: 'skillOK1',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.ARCHIVED,
        };
        const wrongSkillData = {
          id: 'challengeWrongSkill',
          locales: ['fr-BE'],
          skillId: 'skillFoo',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
        };
        const matchingChallenge1 = {
          id: 'challengeZ',
          locales: ['fr-BE'],
          skillId: 'skillOK1',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
          timer: null,
        };
        const matchingChallenge2 = {
          id: 'challengeA',
          locales: ['fr-LU', 'fr-BE'],
          skillId: 'skillOK2',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.ARCHIVED,
          timer: 456,
        };
        const matchingChallenge3 = {
          id: 'challengeL',
          locales: ['fr', 'fr-LU'],
          skillId: 'skillOK2',
          status: domainBuilder.evaluation.buildSmartRandomChallenge.STATUSES.VALIDATED,
          timer: null,
        };
        databaseBuilder.factory.learningContent.build(
          {
            challenges: [
              wrongStatusData,
              wrongLocaleData,
              wrongSkillData,
              matchingChallenge1,
              matchingChallenge2,
              matchingChallenge3,
            ],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomChallenges = await smartRandomChallengeRepository.findOperativeBySkillsAndLocales(
          [{ id: 'skillOK1' }, { id: 'skillOK2' }],
          locales,
        );

        expect(smartRandomChallenges).to.deepEqualArray([
          domainBuilder.evaluation.buildSmartRandomChallenge(matchingChallenge2),
          domainBuilder.evaluation.buildSmartRandomChallenge(matchingChallenge3),
          domainBuilder.evaluation.buildSmartRandomChallenge(matchingChallenge1),
        ]);
      });
    });
  });
});
