const jsonwebtoken = require('jsonwebtoken');
const { expect, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/settings');
const passwordResetService = require('../../../../lib/domain/services/password-reset-service');
const passwordResetDemandRepository = require('../../../../lib/infrastructure/repositories/password-reset-demand-repository');

describe('Unit | Service | Password Reset Service', () => {

  describe('#generateTemporaryKey', () => {

    it('should return a valid JWT', () => {
      // given
      const userId = '123';

      // when
      const temporaryKey = passwordResetService.generateTemporaryKey(userId);
      const decoded = jsonwebtoken.verify(temporaryKey, settings.temporaryKey.secret);

      // then
      expect(decoded.userId).to.be.equal(userId);
    });
  });

  describe('#extractUserIdFromTemporaryKey', () => {
    const userId = '123';
    let temporaryKey;
    let stub;

    describe('When the passwordResetDemand is not used', () => {

      before(() => {
        temporaryKey = passwordResetService.generateTemporaryKey(userId);

        stub = sinon.stub(passwordResetDemandRepository, 'findByTemporaryKey').resolves({
          toJSON: () => ({
            temporaryKey,
            used: false,
            email: 'cool_guy@example.com',
          }),
        });
      });

      after(() => {
        stub.restore();
      });

      it('should resolve the userId', async () => {
        // when
        const returnedUserId = await passwordResetService.extractUserIdFromTemporaryKey(temporaryKey);

        // then
        expect(returnedUserId).to.be.equal(userId);
      });

    });

    describe('When the passwordResetDemand is used', () => {

      before(() => {
        temporaryKey = passwordResetService.generateTemporaryKey(userId);

        stub = sinon.stub(passwordResetDemandRepository, 'findByTemporaryKey').resolves({
          toJSON: () => ({
            temporaryKey,
            used: true,
            email: 'cool_guy@example.com',
          }),
        });
      });

      after(() => {
        stub.restore();
      });

      it('should reject', () => {
        // when
        const promise = passwordResetService.extractUserIdFromTemporaryKey(temporaryKey);

        // then
        expect(promise).to.be.rejected;
      });
    });

    describe('When the temporaryKey is invalid', () => {

      before(() => {
        temporaryKey = 'invalid';

        stub = sinon.stub(passwordResetDemandRepository, 'findByTemporaryKey').resolves({
          toJSON: () => ({
            temporaryKey,
            used: true,
            email: 'cool_guy@example.com',
          }),
        });
      });

      after(() => {
        stub.restore();
      });

      it('should reject', () => {
        // when
        const promise = passwordResetService.extractUserIdFromTemporaryKey(temporaryKey);

        // then
        expect(promise).to.be.rejected;
      });
    });

  });

});
