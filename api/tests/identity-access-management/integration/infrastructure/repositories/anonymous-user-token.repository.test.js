import { anonymousUserTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/anonymous-user-token.repository.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { expect } from '../../../../test-helper.js';

const anonymousUserTokensTemporaryStorage = temporaryStorage.withPrefix('anonymous-user-tokens:');

describe('Integration | Identity Access Management | Infrastructure | Repository | anonymousUserTokenRepository', function () {
  const userId = '123';

  afterEach(async function () {
    await anonymousUserTokensTemporaryStorage.flushAll();
  });

  describe('#find', function () {
    it('returns the "token" for the userId', async function () {
      // given
      const expectedToken = 'my-token';
      await anonymousUserTokensTemporaryStorage.save({ key: userId, value: expectedToken });

      // when
      const result = await anonymousUserTokenRepository.find(userId);

      // then
      expect(result).to.deep.equal(expectedToken);
    });

    context('when user id does not exist', function () {
      it('returns "null"', async function () {
        // when
        const result = await anonymousUserTokenRepository.find(userId);

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#save', function () {
    const UUID_PATTERN = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

    it('saves a token for the user', async function () {
      // when
      const token = await anonymousUserTokenRepository.save(userId);

      // then
      const storedToken = await anonymousUserTokensTemporaryStorage.get(userId);
      expect(storedToken).to.match(UUID_PATTERN);
      expect(storedToken).to.equal(token);
    });
  });
});
