import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { updateAuthenticationComplement } from '../../../../lib/domain/usecases/update-authentication-complement.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('unit | domain | usecases | update-authentication-complement', function () {
  it('updates authentication complement', async function () {
    //given
    const authenticationMethodRepository = {
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
      update: sinon.stub().resolves(),
    };
    const externalIdentifier = 'externalIdentifier';
    const identityProvider = 'FWB';
    const authenticationComplement = {};
    const id = 1;
    const authenticationMethod = domainBuilder.buildAuthenticationMethod.withIdentityProvider({
      id,
      identityProvider,
      externalIdentifier,
    });
    authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider.resolves(authenticationMethod);

    //when
    await updateAuthenticationComplement({
      authenticationMethodRepository,
      externalIdentifier,
      identityProvider,
      authenticationComplement,
    });

    //then
    expect(
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider,
    ).to.have.been.calledWithExactly({ externalIdentifier, identityProvider });
    expect(authenticationMethodRepository.update).to.have.been.calledWithExactly({ id, authenticationComplement });
  });

  context('when there is no authentication method', function () {
    it('throws a NotFound error', async function () {
      // given
      const authenticationMethodRepository = {
        findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
      };
      const externalIdentifier = 'externalIdentifier';
      const identityProvider = 'FWB';
      const authenticationComplement = {};

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider.resolves(null);

      // when
      const error = await catchErr(updateAuthenticationComplement)({
        authenticationMethodRepository,
        externalIdentifier,
        identityProvider,
        authenticationComplement,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
