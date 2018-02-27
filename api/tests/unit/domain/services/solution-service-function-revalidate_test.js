const { expect, knex, sinon } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service');
const Answer = require('../../../../lib/infrastructure/data/answer');
const SolutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

describe('Unit | Service | SolutionService', function() {

  describe('#revalidate', function() {

    const ko_answer = {
      id: 1,
      value: '1,2,3',
      result: 'ko',
      challengeId: 'any_challenge_id'
    };

    const ok_answer = {
      id: 2,
      value: '1, 2, 3',
      result: 'partially',
      challengeId: 'any_challenge_id'
    };

    const unimplemented_answer = {
      id: 4,
      value: '1,2,3',
      result: 'unimplemented',
      challengeId: 'any_challenge_id'
    };

    const aband_answer = {
      id: 5,
      value: '#ABAND#',
      result: 'aband',
      challengeId: 'any_challenge_id'
    };

    const timedout_answer = {
      id: 6,
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'any_challenge_id'
    };

    before(function(done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([ko_answer, ok_answer, unimplemented_answer, aband_answer, timedout_answer]).then(() => {
          done();
        });
      });
    });

    after(function() {
      return knex('answers').delete();
    });

    it('If the answer is timedout, resolve to the answer itself, unchanged', function(done) {
      expect(service.revalidate).to.exist;
      service.revalidate(new Answer(timedout_answer)).then(function(foundAnswer) {
        expect(foundAnswer.id).equals(timedout_answer.id);
        expect(foundAnswer.attributes.value).equals(timedout_answer.value);
        expect(foundAnswer.attributes.result).equals(timedout_answer.result);
        expect(foundAnswer.attributes.challengeId).equals(timedout_answer.challengeId);
        done();
      });
    });

    it('If the answer is aband, resolve to the answer itself, unchanged', function(done) {
      expect(service.revalidate).to.exist;
      service.revalidate(new Answer(aband_answer)).then(function(foundAnswer) {
        expect(foundAnswer.id).equals(aband_answer.id);
        expect(foundAnswer.attributes.value).equals(aband_answer.value);
        expect(foundAnswer.attributes.result).equals(aband_answer.result);
        expect(foundAnswer.attributes.challengeId).equals(aband_answer.challengeId);
        done();
      });
    });

    it('If the answer is ko, resolve to the answer itself, with result corresponding to the matching', function(done) {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(SolutionRepository, 'get').resolves({});
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      service.revalidate(new Answer(ko_answer)).then(function(foundAnswer) {

        // then
        SolutionRepository.get.restore();
        service.validate.restore();

        expect(SolutionRepository.get.callOnce);
        expect(service.validate.callOnce);
        expect(foundAnswer.id).equals(ko_answer.id);
        expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);

        done();
      });

    });

    it('If the answer is ok, resolve to the answer itself, with result corresponding to the matching', function(done) {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(SolutionRepository, 'get').resolves({}); // avoid HTTP call, but what it replies doesn't matter
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      service.revalidate(new Answer(ok_answer)).then(function(foundAnswer) {

        // then
        SolutionRepository.get.restore();
        service.validate.restore();

        expect(SolutionRepository.get.callOnce);
        expect(service.validate.callOnce);
        expect(foundAnswer.id).equals(ok_answer.id);
        expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);

        done();
      });

    });

    it('If the answer is unimplemented, resolve to the answer itself, with result corresponding to the matching', function(done) {

      // given
      const MATCHING_RETURNS = { result: '#ANY_RESULT#', resultDetails: null };

      sinon.stub(SolutionRepository, 'get').resolves({}); // avoid HTTP call, but what it replies doesn't matter
      sinon.stub(service, 'validate').returns(MATCHING_RETURNS);
      expect(service.revalidate).to.exist;

      // when
      service.revalidate(new Answer(unimplemented_answer)).then(function(foundAnswer) {

        // then
        SolutionRepository.get.restore();
        service.validate.restore();

        expect(SolutionRepository.get.callOnce);
        expect(service.validate.callOnce);
        expect(foundAnswer.id).equals(unimplemented_answer.id);
        expect(foundAnswer.attributes.result).equals(MATCHING_RETURNS.result);

        done();
      });

    });

  });

});
