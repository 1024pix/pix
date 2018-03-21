const { expect, sinon } = require('../../../test-helper');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const DomainUser = require('../../../../lib/domain/models/User');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Infrastructure | Repository | UserRepository', () => {

  describe('#get', () => {

    beforeEach(() => {
      sinon.stub(BookshelfUser.prototype, 'where');
    });

    afterEach(() => {
      BookshelfUser.prototype.where.restore();
    });

    it('should resolve a domain User matching its ID', () => {
      // given
      const userId = 1234;
      const domainUser = new DomainUser({ id: userId, firstName: 'John', lastName: 'Doe', email: 'jdoe@example.net' });
      const bookshelfUser = { toDomainEntity: () => domainUser };
      const fetchStub = sinon.stub().resolves(bookshelfUser);
      BookshelfUser.prototype.where.returns({ fetch: fetchStub });

      // when
      const promise = userRepository.get(userId);

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(domainUser);
        expect(BookshelfUser.prototype.where).to.have.been.calledWithExactly({ id: userId });
        expect(fetchStub).to.have.been.calledWithExactly({ require: true, withRelated: ['pixRoles'] });
      });
    });

    it('should reject a domain NotFoundError when the user was  not found', () => {
      // given
      const userId = 1234;
      const fetchStub = sinon.stub().rejects(new BookshelfUser.NotFoundError());
      BookshelfUser.prototype.where.returns({ fetch: fetchStub });

      // when
      const promise = userRepository.get(userId);

      // then
      return promise
        .then(() => expect.fail('Expected an error to have been thrown.'))
        .catch(err => expect(err).to.be.an.instanceof(NotFoundError));
    });

  });

});

