const { describe, beforeEach, afterEach, it, sinon, expect } = require('../../../test-helper');
const ResetPasswordDemandRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');
const ResetPasswordDemand = require('../../../../lib/domain/models/data/reset-password-demand');
const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Repository | Reset Password Demand Repository', function() {

  beforeEach(() => {
    sinon.stub(ResetPasswordDemand.prototype, 'save');
  });

  afterEach(() => {
    ResetPasswordDemand.prototype.save.restore();
  });

  describe('#create', () => {

    it('should save a new reset password demand', () => {
      // given
      const resetPasswordDemand = {};
      ResetPasswordDemand.prototype.save.resolves();

      // when
      const promise = ResetPasswordDemandRepository.create(resetPasswordDemand);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(ResetPasswordDemand.prototype.save);
      });
    });
  });

  describe('#markAsBeingUsed', () => {

    it('should save a new reset password demand', () => {
      // given
      const temporaryKey = 'temp_key';
      ResetPasswordDemand.prototype.save.resolves();

      // when
      const promise = ResetPasswordDemandRepository.markAsBeingUsed(temporaryKey);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(ResetPasswordDemand.prototype.save, { used: true }, { patch: true, require: false });
      });
    });
  });

  describe('#findByTemporaryKey', () => {

    beforeEach(() => {
      sinon.stub(ResetPasswordDemand, 'where');
    });

    afterEach(() => {
      ResetPasswordDemand.where.restore();
    });

    it('should be a function', () => {
      // then
      expect(ResetPasswordDemandRepository.findByTemporaryKey).to.be.a('function');
    });

    it('should retrieve a record', () => {
      // given
      const fetchStub = sinon.stub().resolves(true);
      const temporaryKey = 'temp_key';
      ResetPasswordDemand.where.returns({
        fetch: fetchStub
      });
      const expectedWhereArgs = { temporaryKey, used: false };

      // when
      const promise = ResetPasswordDemandRepository.findByTemporaryKey(temporaryKey);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(ResetPasswordDemand.where);
        sinon.assert.calledWith(ResetPasswordDemand.where, expectedWhereArgs);
        sinon.assert.calledOnce(fetchStub);
        sinon.assert.calledWith(fetchStub, { require: true });
      });
    });

    it('should reject with PasswordResetDemandNotFoundError, when demand is not found', () => {
      // given
      const fetchStub = sinon.stub().resolves(ResetPasswordDemand.NotFoundError());
      const temporaryKey = 'unknown_temporary_key';
      ResetPasswordDemand.where.returns({
        fetch: fetchStub
      });

      // when
      const promise = ResetPasswordDemandRepository.findByTemporaryKey(temporaryKey);
      // then
      return promise.catch((isFound) => {
        expect(isFound).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    it('should resolves with demand details, when it has been found', () => {
      // given
      const fetchStub = sinon.stub().resolves(true);
      const temporaryKey = 'temporary_key';
      ResetPasswordDemand.where.returns({
        fetch: fetchStub
      });

      // when
      const promise = ResetPasswordDemandRepository.findByTemporaryKey(temporaryKey);
      // then
      return promise.then((isFound) => {
        expect(isFound).to.be.true;
      });
    });

  });

  describe('#findByUserEmail', () => {

    beforeEach(() => {
      sinon.stub(ResetPasswordDemand, 'where');
    });

    afterEach(() => {
      ResetPasswordDemand.where.restore();
    });

    it('should be a function', () => {
      // then
      expect(ResetPasswordDemandRepository.findByUserEmail).to.be.a('function');
    });

    it('should retrieve a record', () => {
      // given
      const fetchStub = sinon.stub().resolves(true);
      const email = 'shi@fu.me';
      ResetPasswordDemand.where.returns({
        fetch: fetchStub
      });
      const expectedWhereArgs = { email: 'shi@fu.me' };

      // when
      const promise = ResetPasswordDemandRepository.findByUserEmail(email);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(ResetPasswordDemand.where);
        sinon.assert.calledWith(ResetPasswordDemand.where, expectedWhereArgs);
        sinon.assert.calledOnce(fetchStub);
        sinon.assert.calledWith(fetchStub, { require: true });
      });
    });

  });

});
