import * as userRepository from '../../../../../src/legal-documents/infrastructure/repositories/user.repository.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Legal documents | Infrastructure | Repository | UserRepository', function () {
  describe('#getPixAppLegacyCguByUserId', function () {
    it('returns the legacy CGU data for a user', async function () {
      // given
      const lastTermsOfServiceValidatedAt = new Date('2024-03-15');
      const user = databaseBuilder.factory.buildUser({
        cgu: true,
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt,
      });
      await databaseBuilder.commit();

      // when
      const result = await userRepository.getPixAppLegacyCguByUserId(user.id);

      // then
      expect(result.cgu).to.be.true;
      expect(result.mustValidateTermsOfService).to.be.false;
      expect(result.lastTermsOfServiceValidatedAt).to.deep.equal(lastTermsOfServiceValidatedAt);
    });

    it('returns cgu=false and mustValidateTermsOfService=false for a user who has not accepted CGU', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({
        cgu: false,
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
      });
      await databaseBuilder.commit();

      // when
      const result = await userRepository.getPixAppLegacyCguByUserId(user.id);

      // then
      expect(result.cgu).to.be.false;
      expect(result.mustValidateTermsOfService).to.be.false;
      expect(result.lastTermsOfServiceValidatedAt).to.be.null;
    });

    it('throws UserNotFoundError when user does not exist', async function () {
      // given / when
      const error = await catchErr(userRepository.getPixAppLegacyCguByUserId)(999999);

      // then
      expect(error).to.be.instanceof(UserNotFoundError);
    });
  });
});
