const { expect } = require('../../../test-helper');
const getNextChallengeForPreview = require('../../../../lib/domain/usecases/get-next-challenge-for-preview');

const { AssessmentEndedError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-next-challenge-for-preview', function() {

  describe('#getNextChallengeForPreview', function() {

    it('should trigger an AssessmentEndedError', function() {
      // when
      const promise = getNextChallengeForPreview();

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });

  });

});
