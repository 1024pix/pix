const { domainBuilder, databaseBuilder, expect, sinon } = require('../../../../test-helper');

const service = require('../../../../../lib/domain/services/solution-service');
const Answer = require('../../../../../lib/infrastructure/data/answer');
const solutionRepository = require('../../../../../lib/infrastructure/repositories/solution-repository');
const _ = require('lodash');

describe('Integration | Service | SolutionService', function() {

  describe('#revalidate', function() {

    let ko_answer, ok_answer, unimplemented_answer;

    beforeEach(() => {
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      ko_answer = domainBuilder.buildAnswer(
        { id: 1,
          value: '1,2,3',
          result: 'ko',
          challengeId: 'any_challenge_id',
          assessmentId,
        });
      ok_answer = domainBuilder.buildAnswer(
        { id: 2,
          value: '1, 2, 3',
          result: 'partially',
          challengeId: 'any_challenge_id',
          assessmentId,
        });
      unimplemented_answer = domainBuilder.buildAnswer({
        id: 4,
        value: '1,2,3',
        result: 'unimplemented',
        challengeId: 'any_challenge_id',
        assessmentId,
      });
      _.each([ ko_answer, ok_answer, unimplemented_answer], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('If the answer is ko, resolve to the answer itself, with result corresponding to the matching', async () => {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(solutionRepository, 'getByChallengeId').resolves({});
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      const foundAnswer = await service.revalidate(new Answer(ko_answer));

      // then
      expect(solutionRepository.getByChallengeId.callOnce);
      expect(service.validate.callOnce);
      expect(foundAnswer.id).equals(ko_answer.id);
      expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);

    });

    it('If the answer is ok, resolve to the answer itself, with result corresponding to the matching', async () => {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(solutionRepository, 'getByChallengeId').resolves({}); // avoid HTTP call, but what it replies
      // doesn't matter
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      const foundAnswer = await service.revalidate(new Answer(ok_answer));

      // then
      expect(solutionRepository.getByChallengeId.callOnce);
      expect(service.validate.callOnce);
      expect(foundAnswer.id).equals(ok_answer.id);
      expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);
    });

    it('If the answer is unimplemented, resolve to the answer itself, with result corresponding to the matching', async() => {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(solutionRepository, 'getByChallengeId').resolves({}); // avoid HTTP call, but what it replies
      // doesn't matter
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      const foundAnswer = await service.revalidate(new Answer(unimplemented_answer));

      // then
      expect(solutionRepository.getByChallengeId.callOnce);
      expect(service.validate.callOnce);
      expect(foundAnswer.id).equals(unimplemented_answer.id);
      expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);
    });

  });

});
