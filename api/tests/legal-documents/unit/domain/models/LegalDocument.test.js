import { LegalDocument } from '../../../../../src/legal-documents/domain/models/LegalDocument.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Legal documents | Domain | Model | LegalDocument', function () {
  describe('#buildDocumentPath', function () {
    it('builds the document path', function () {
      // given
      const service = LegalDocumentService.VALUES.PIX_ORGA;
      const type = LegalDocumentType.VALUES.TOS;
      const versionAt = new Date('2024-01-01');

      // when
      const legalDocumentStatus = new LegalDocument({ service, type, versionAt });
      const documentPath = legalDocumentStatus.buildDocumentPath();

      // then
      expect(documentPath).to.be.equal(`pix-orga-tos-2024-01-01`);
    });
  });
});
