const { expect, sinon } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserIsAuthenticated');
const tokenService = require('../../../../lib/domain/services/token-service');
const { InvalidTemporaryKeyError } = require('../../../../lib/domain/errors');

describe('Unit | Application | Use Case | CheckUserIsAuthenticated', function() {

  const accessToken = 'jwt.access.token';

  beforeEach(function() {
    sinon.stub(tokenService, 'decodeIfValid');
  });

  it('should resolve credentials (ie. userId) when JWT access token is valid', function() {
    // given
    const authenticatedUser = { user_id: 1234 };
    tokenService.decodeIfValid.resolves(authenticatedUser);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal(authenticatedUser);
    });
  });

  it('should resolve "false" when JWT access token is not valid', function() {
    // given
    tokenService.decodeIfValid.resolves(null);

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal(null);
    });
  });

  it('should reject when an error is thrown during access token verification', function() {
    // given
    tokenService.decodeIfValid.rejects(new InvalidTemporaryKeyError());

    // when
    const promise = useCase.execute(accessToken);

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal(false);
    });
  });

});
