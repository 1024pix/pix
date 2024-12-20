import Joi from 'joi';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Unit | Legal documents | Domain | Use case | get-legal-document-status-by-user-id', function () {
  context('when the legal document type is invalid', function () {
    it('throws an error', async function () {
      // given
      const type = 'invalid-type';
      const service = PIX_ORGA;
      const userId = 123;

      // when / then
      await expect(usecases.getLegalDocumentStatusByUserId({ service, type, userId })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });

  context('when the legal document service is invalid', function () {
    it('throws an error', async function () {
      // given
      const type = TOS;
      const service = 'invalid-service';
      const userId = 123;

      // when / then
      await expect(usecases.getLegalDocumentStatusByUserId({ service, type, userId })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });
});
