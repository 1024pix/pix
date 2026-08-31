import { expect } from 'chai';
import sinon from 'sinon';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import * as userRepository from '../../../../../src/legal-documents/infrastructure/repositories/user.repository.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const { PIX_APP } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

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

  describe('#acceptLegacyPixAppTermsOfService', function () {
    it('validates the last terms of service and save the date of acceptance ', async function () {
      // given
      const now = new Date('2022-12-24');
      sinon.useFakeTimers({ now, toFake: ['Date'] });
      const userId = databaseBuilder.factory.buildUser({
        mustValidateTermsOfService: true,
        lastTermsOfServiceValidatedAt: null,
      }).id;
      databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_APP, type: TOS });
      await databaseBuilder.commit();

      // when
      await userRepository.acceptLegacyPixAppTermsOfService(userId);
      const actualUser = await knex('users').where({ id: userId }).first();

      // then
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.exist;
      expect(actualUser.lastTermsOfServiceValidatedAt).to.be.a('Date');
      expect(actualUser.mustValidateTermsOfService).to.be.false;
      expect(actualUser.cgu).to.be.true;
      expect(actualUser.updatedAt).to.deep.equal(now);
    });
  });
});
