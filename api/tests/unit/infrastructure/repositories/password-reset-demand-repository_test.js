const { sinon, expect } = require('../../../test-helper');
const PasswordResetDemandRepository = require('../../../../lib/infrastructure/repositories/password-reset-demand-repository');
const BookshelfPasswordResetDemand = require('../../../../lib/infrastructure/data/password-reset-demand');
const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Repository | Password Reset Demand Repository', () => {

  beforeEach(() => {
    sinon.stub(BookshelfPasswordResetDemand.prototype, 'save');
  });

  describe('#create', () => {

    it('should be a function', () => {
      expect(PasswordResetDemandRepository.create).to.be.a('function');
    });

    it('should save a new reset password demand', async () => {
      // given
      const resetPasswordDemand = {};

      BookshelfPasswordResetDemand.prototype.save.resolves();

      // when
      await PasswordResetDemandRepository.create(resetPasswordDemand);

      // then
      sinon.assert.calledOnce(BookshelfPasswordResetDemand.prototype.save);
    });
  });

  describe('#markAsUsed', () => {

    it('should be a function', () => {
      expect(PasswordResetDemandRepository.markAsUsed).to.be.a('function');
    });

    it('should save a new reset password demand', async () => {
      // given
      const temporaryKey = 'temporaryKey';

      BookshelfPasswordResetDemand.prototype.save.resolves();

      // when
      await PasswordResetDemandRepository.markAsUsed(temporaryKey);

      // then
      sinon.assert.calledWith(BookshelfPasswordResetDemand.prototype.save, { used: true }, { patch: true, require: false });
    });
  });

  describe('#findByTemporaryKey', () => {

    beforeEach(() => {
      sinon.stub(BookshelfPasswordResetDemand, 'where');
    });

    it('should be a function', () => {
      expect(PasswordResetDemandRepository.findByTemporaryKey).to.be.a('function');
    });

    it('should retrieve a record', async () => {
      // given
      const fetchStub = sinon.stub().resolves(true);
      const temporaryKey = 'temporaryKey';

      BookshelfPasswordResetDemand.where.returns({ fetch: fetchStub });

      const expectedWhereArgs = { temporaryKey };

      // when
      await PasswordResetDemandRepository.findByTemporaryKey(temporaryKey);

      // then
      sinon.assert.calledOnce(BookshelfPasswordResetDemand.where);
      sinon.assert.calledWith(BookshelfPasswordResetDemand.where, expectedWhereArgs);
      sinon.assert.calledOnce(fetchStub);
      sinon.assert.calledWith(fetchStub, { require: true });
    });

    it('should reject with PasswordResetDemandNotFoundError, when demand is not found', () => {
      // given
      const fetchStub = sinon.stub().resolves(BookshelfPasswordResetDemand.NotFoundError());
      const temporaryKey = 'unknownTemporaryKey';

      BookshelfPasswordResetDemand.where.returns({ fetch: fetchStub });

      // when
      const promise = PasswordResetDemandRepository.findByTemporaryKey(temporaryKey);
      // then
      return promise.catch((error) => {
        expect(error).to.be.an.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    it('should resolves with demand details, when it has been found', async () => {
      // given
      const fetchStub = sinon.stub().resolves(true);
      const temporaryKey = 'temporaryKey';

      BookshelfPasswordResetDemand.where.returns({ fetch: fetchStub });

      // when
      const data = await PasswordResetDemandRepository.findByTemporaryKey(temporaryKey);

      // then
      expect(data).to.be.true;
    });
  });
});
