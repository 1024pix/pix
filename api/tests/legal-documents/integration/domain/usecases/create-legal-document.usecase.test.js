import { LegalDocumentInvalidDateError } from '../../../../../src/legal-documents/domain/errors.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal documents | Domain | Use case | create-legal-document', function () {
  it('creates a new legal document when there is no previous version', async function () {
    // given
    const type = TOS;
    const service = PIX_ORGA;
    const versionAt = new Date('2024-12-01');
    const expectedDocument = domainBuilder.buildLegalDocument({ service, type, versionAt });

    // when
    const document = await usecases.createLegalDocument({ service, type, versionAt });

    // then
    expect(document).to.deepEqualInstanceOmitting(expectedDocument, 'id');
  });

  context('when a previous version exists', function () {
    it('throws an error if the new version date is before or equal to the existing version date', async function () {
      // given
      const type = TOS;
      const service = PIX_ORGA;
      const existingVersionAt = new Date('2024-12-01');
      const newVersionAt = new Date('2024-11-30');

      databaseBuilder.factory.buildLegalDocumentVersion({ service, type, versionAt: existingVersionAt });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.createLegalDocument)({ service, type, versionAt: newVersionAt });

      //then
      expect(error).to.be.instanceOf(LegalDocumentInvalidDateError);
      expect(error.message).to.be.equal(
        'Document version must not be before or equal to same document service and type',
      );
    });

    it('creates a new document if the new version date is after the existing version date', async function () {
      // given
      const type = TOS;
      const service = PIX_ORGA;
      const existingVersionAt = new Date('2024-12-01');
      const newVersionAt = new Date('2024-12-02');
      const expectedDocument = domainBuilder.buildLegalDocument({ service, type, versionAt: newVersionAt });

      databaseBuilder.factory.buildLegalDocumentVersion({ service, type, versionAt: existingVersionAt });
      await databaseBuilder.commit();

      // when
      const document = await usecases.createLegalDocument({ service, type, versionAt: newVersionAt });

      // then
      expect(document).to.deepEqualInstanceOmitting(expectedDocument, 'id');
    });
  });
});
