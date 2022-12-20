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
    it('should create an emailAttempt with failure status', function () {
      // when
      const result = EmailingAttempt.failure('example@example.net');

      // then
      const expectedEmailAttempt = new EmailingAttempt('example@example.net', 'FAILURE');
      expect(result).to.deepEqualInstance(expectedEmailAttempt);
    });
  });
});
