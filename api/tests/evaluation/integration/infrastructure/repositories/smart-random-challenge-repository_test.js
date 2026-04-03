import * as smartRandomChallengeRepository from '../../../../../src/evaluation/infrastructure/repositories/smart-random-challenge-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

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
});
