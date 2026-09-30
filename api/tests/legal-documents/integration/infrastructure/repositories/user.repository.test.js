import { expect } from 'chai';
import sinon from 'sinon';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import * as userRepository from '../../../../../src/legal-documents/infrastructure/repositories/user.repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { PIX_APP } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal documents | Infrastructure | Repository | UserRepository', function () {
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
