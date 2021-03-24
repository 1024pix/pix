const { expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service');
const Answer = require('../../../../lib/infrastructure/data/answer');

describe('Unit | Service | SolutionService', function() {

  describe('#revalidate', function() {

    const aband_answer = {
      id: 5,
      value: '#ABAND#',
      result: 'aband',
      challengeId: 'any_challenge_id',
    };

    const timedout_answer = {
      id: 6,
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'any_challenge_id',
    };

    it('If the answer is timedout, resolve to the answer itself, unchanged', function(done) {
      expect(service.revalidate).to.exist;
      service.revalidate(new Answer(timedout_answer)).then((foundAnswer) => {
        expect(foundAnswer.id).equals(timedout_answer.id);
        expect(foundAnswer.attributes.value).equals(timedout_answer.value);
        expect(foundAnswer.attributes.result).equals(timedout_answer.result);
        expect(foundAnswer.attributes.challengeId).equals(timedout_answer.challengeId);
        done();
      });
    });

    it('If the answer is aband, resolve to the answer itself, unchanged', function(done) {
      expect(service.revalidate).to.exist;
      service.revalidate(new Answer(aband_answer)).then((foundAnswer) => {
        expect(foundAnswer.id).equals(aband_answer.id);
        expect(foundAnswer.attributes.value).equals(aband_answer.value);
        expect(foundAnswer.attributes.result).equals(aband_answer.result);
        expect(foundAnswer.attributes.challengeId).equals(aband_answer.challengeId);
        done();
      });
    });

  });

});
