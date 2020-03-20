const { expect } = require('../../../test-helper');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');

describe('Integration | Service | Password Service', function() {

  describe('#generateTemporaryKey', function() {

    context('when two users send a request at the same second', function() {

      it('should generate different temporaryKeys', function() {

        // when
        const temporaryKeyUser1 = resetPasswordService.generateTemporaryKey();
        const temporaryKeyUser2 = resetPasswordService.generateTemporaryKey();

        // then
        expect(temporaryKeyUser1).to.not.equal(temporaryKeyUser2);
      });
    });

  });
});
