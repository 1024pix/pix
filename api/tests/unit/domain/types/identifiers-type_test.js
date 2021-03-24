const { expect } = require('../../../test-helper');
const { userId, competenceId } = require('../../../../lib/domain/types/identifiers-type');
const faker = require('faker');

describe('Unit | Domain | Type | identifier-types', function() {

  describe('#userId', function() {

    context('when id is valid', function() {

      it('should not reject', function() {
        // given
        const validId = 1;

        // when
        const { error } = userId.validate(validId);

        // then
        expect(error).to.be.undefined;
      });
    });

    context('when id is invalid', function() {

      it('should reject outside of lower bound', async function() {
        // given
        const lowerBoundOutOfRangeId = 0;

        // when
        const { error } = userId.validate(lowerBoundOutOfRangeId);

        // then
        expect(error.message).to.equal('"value" must be greater than or equal to 1');
      });

      it('should reject outside of upper bound', async function() {
        // given
        const upperBoundOutOfRangeId = 2147483648;

        // when
        const { error } = userId.validate(upperBoundOutOfRangeId);

        // then
        expect(error.message).to.equal('"value" must be less than or equal to 2147483647');
      });

    });
  });

  describe('#competenceId', function() {

    context('when id is valid', function() {

      it('should not reject', function() {
        // given
        const validId = '1234567890123456';

        // when then
        const { error } = competenceId.validate(validId);

        // then
        expect(error).to.be.undefined;
      });
    });

    context('when id is invalid', function() {

      it('should reject when empty', async function() {
        // given
        const emptyString = '';

        // when
        const { error } = competenceId.validate(emptyString);

        // then
        expect(error.message).to.equal('"value" is not allowed to be empty');
      });

      it('should reject when too large', async function() {
        // given
        const tooLargeString = faker.random.alphaNumeric(256);

        // when
        const { error } = competenceId.validate(tooLargeString);

        // then
        expect(error.message).to.equal('"value" length must be less than or equal to 255 characters long');
      });

    });
  });
});
