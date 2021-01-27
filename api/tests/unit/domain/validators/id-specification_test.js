const { expect } = require('../../../test-helper');
const { userId } = require('../../../../lib/domain/validators/id-specification');

describe('Unit | Domain | Validators | id-specification', () => {

  describe('#idSpecification', () => {

    context('when id is valid', () => {

      it('should not reject', () => {
        // given
        const validId = 1;

        // when
        const { error } = userId.validate(validId);

        // then
        expect(error).to.be.undefined;
      });
    });

    context('when id is invalid', () => {

      it('should reject outside of lower bound', async () => {
        // given
        const lowerBoundOutOfRangeId = 0;

        // when
        const { error } = userId.validate(lowerBoundOutOfRangeId);

        // then
        expect(error.message).to.equal('"value" must be greater than or equal to 1');
      });

      it('should reject outside of upper bound', async () => {
        // given
        const upperBoundOutOfRangeId = 2147483648;

        // when
        const { error } = userId.validate(upperBoundOutOfRangeId);

        // then
        expect(error.message).to.equal('"value" must be less than or equal to 2147483647');
      });

    });
  });
});
