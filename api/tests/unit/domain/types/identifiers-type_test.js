const { expect } = require('../../../test-helper');
const { userId, competenceId } = require('../../../../lib/domain/types/identifiers-type');

describe('Unit | Domain | Type | identifier-types', () => {

  describe('#userId', () => {

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

  describe('#competenceId', () => {

    context('when id is valid', () => {

      it('should not reject', () => {
        // given
        const validId = '1234567890123456';

        // when then
        const { error } = competenceId.validate(validId);

        // then
        expect(error).to.be.undefined;
      });
    });

    context('when id is invalid', () => {

      it('should reject when empty', async () => {
        // given
        const emptyString = '';

        // when
        const { error } = competenceId.validate(emptyString);

        // then
        expect(error.message).to.equal('"value" is not allowed to be empty');
      });

      it('should reject when too large', async () => {
        // given
        const tooLargeString = 'A'.repeat(256);

        // when
        const { error } = competenceId.validate(tooLargeString);

        // then
        expect(error.message).to.equal('"value" length must be less than or equal to 255 characters long');
      });

    });
  });
});
