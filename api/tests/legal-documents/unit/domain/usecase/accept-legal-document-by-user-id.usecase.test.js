import Joi from 'joi';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Unit | Legal documents | Domain | Use case | accept-legal-document-by-user-id', function () {
  context('when the legal document type is invalid', function () {
    it('throws an error', async function () {
      // given
      const userId = 123;
      const service = PIX_ORGA;
      const type = 'invalid-type';

      // when / then
      await expect(usecases.acceptLegalDocumentByUserId({ userId, service, type })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });

  context('when the legal document service is invalid', function () {
    it('throws an error', async function () {
      // given
      const userId = 123;
      const service = 'invalid-service';
      const type = TOS;

      // when / then
      await expect(usecases.acceptLegalDocumentByUserId({ userId, service, type })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });
});
