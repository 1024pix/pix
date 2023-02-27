const { expect } = require('../../../test-helper');

const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');

describe('Unit | Domain | Models | EmailingAttempt', function () {
  describe('#hasFailed', function () {
    it('should return true if status is failure', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE');

      // when
      const result = attempt.hasFailed();

      // then
      expect(result).to.be.true;
    });

    it('should return false if status is success', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'SUCCESS');

      // when
      const result = attempt.hasFailed();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#hasFailedBecauseDomainWasInvalid', function () {
    it('returns true if status is failure because domain was invalid', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE', 'INVALID_DOMAIN');

      // when
      const result = attempt.hasFailedBecauseDomainWasInvalid();

      // then
      expect(result).to.be.true;
    });

    it('returns false if status is failure with another reason', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE');

      // when
      const result = attempt.hasFailedBecauseDomainWasInvalid();

      // then
      expect(result).to.be.false;
    });

    it('returns false if status is success', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'SUCCESS');

      // when
      const result = attempt.hasFailedBecauseDomainWasInvalid();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#hasFailedBecauseEmailWasInvalid', function () {
    it('returns true if status is failure because email was invalid', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE', 'INVALID_EMAIL');

      // when
      const result = attempt.hasFailedBecauseEmailWasInvalid();

      // then
      expect(result).to.be.true;
    });

    it('returns false if status is failure with another reason', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE');

      // when
      const result = attempt.hasFailedBecauseEmailWasInvalid();

      // then
      expect(result).to.be.false;
    });

    it('returns false if status is success', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'SUCCESS');

      // when
      const result = attempt.hasFailedBecauseEmailWasInvalid();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#hasSucceeded', function () {
    it('should return true if status is success', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'SUCCESS');

      // when
      const result = attempt.hasSucceeded();

      // then
      expect(result).to.be.true;
    });

    it('should return false if status is failure', function () {
      // given
      const attempt = new EmailingAttempt('example@example.net', 'FAILURE');

      // when
      const result = attempt.hasSucceeded();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#success', function () {
    it('should create an emailAttempt with success status', function () {
      // when
      const result = EmailingAttempt.success('example@example.net');

      // then
      const expectedEmailAttempt = new EmailingAttempt('example@example.net', 'SUCCESS');
      expect(result).to.deepEqualInstance(expectedEmailAttempt);
    });
  });

  describe('#failure', function () {
    it('should create an emailAttempt with default error code', function () {
      // when
      const result = EmailingAttempt.failure('example@example.net');

      // then
      const expectedEmailAttempt = new EmailingAttempt('example@example.net', 'FAILURE', 'PROVIDER_ERROR');
      expect(result).to.deepEqualInstance(expectedEmailAttempt);
    });

    it('should create an emailAttempt with given error code', function () {
      // when
      const result = EmailingAttempt.failure('example@example.net', EmailingAttempt.errorCode.INVALID_DOMAIN);

      // then
      const expectedEmailAttempt = new EmailingAttempt('example@example.net', 'FAILURE', 'INVALID_DOMAIN');
      expect(result).to.deepEqualInstance(expectedEmailAttempt);
    });

    context('with given error code and message', function () {
      it('creates an EmailingAttempt error', function () {
        // When
        const result = EmailingAttempt.failure(
          'example@example.net',
          EmailingAttempt.errorCode.INVALID_EMAIL,
          'Failure error message'
        );

        // Then
        const expectedEmailAttempt = new EmailingAttempt(
          'example@example.net',
          'FAILURE',
          'INVALID_EMAIL',
          'Failure error message'
        );
        expect(result).to.deepEqualInstance(expectedEmailAttempt);
      });
    });
  });
});
