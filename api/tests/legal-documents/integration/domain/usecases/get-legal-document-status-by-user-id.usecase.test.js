import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal documents | Domain | Use case | get-legal-document-status-by-user-id', function () {
  it('returns the legal document status for a user', async function () {
    // given
    const service = PIX_ORGA;
    const type = TOS;
    const user = databaseBuilder.factory.buildUser();
    const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
      type,
      service,
      versionAt: new Date('2024-02-01'),
    });
    databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
      userId: user.id,
      legalDocumentVersionId: documentVersion.id,
      acceptedAt: new Date('2024-03-01'),
    });
    await databaseBuilder.commit();

    // when
    const legalDocumentStatus = await usecases.getLegalDocumentStatusByUserId({ userId: user.id, service, type });

    // then
    expect(legalDocumentStatus).to.be.an.instanceOf(LegalDocumentStatus);
    expect(legalDocumentStatus).to.deep.equal({
      status: STATUS.ACCEPTED,
      acceptedAt: new Date('2024-03-01'),
      documentPath: 'pix-orga-tos-2024-02-01',
    });
  });

  context('when the legal document version not found', function () {
    it('returns the requested legal document status', async function () {
      // given
      const service = PIX_ORGA;
      const type = TOS;
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const legalDocumentStatus = await usecases.getLegalDocumentStatusByUserId({ userId: user.id, service, type });

      // then
      expect(legalDocumentStatus).to.be.an.instanceOf(LegalDocumentStatus);
      expect(legalDocumentStatus).to.deep.equal({ status: STATUS.REQUESTED, acceptedAt: null, documentPath: null });
    });
  });
});
