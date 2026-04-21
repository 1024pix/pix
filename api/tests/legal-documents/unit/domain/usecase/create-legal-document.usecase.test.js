import Joi from 'joi';
import sinon from 'sinon';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Unit | Legal documents | Domain | Use case | create-legal-document', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((fn) => {
      return fn({});
    });
  });

  context('when the legal document type is invalid', function () {
    it('throws an error', async function () {
      // given
      const type = 'invalid-type';
      const service = PIX_ORGA;
      const versionAt = new Date('2024-12-01');

      // when / then
      await expect(usecases.createLegalDocument({ service, type, versionAt })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });

  context('when the legal document service is invalid', function () {
    it('throws an error', async function () {
      // given
      const type = TOS;
      const service = 'invalid-service';
      const versionAt = new Date('2024-12-01');

      // when / then
      await expect(usecases.createLegalDocument({ service, type, versionAt })).to.have.been.rejectedWith(
        Joi.ValidationError,
      );
    });
  });
});
