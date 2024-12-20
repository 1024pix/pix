import * as legalDocumentsApi from '../../../../../src/legal-documents/application/api/legal-documents-api.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { config } from '../../../../../src/shared/config.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Privacy | Application | Api | legal documents', function () {
  describe('#acceptLegalDocumentByUserId', function () {
    it('accepts the latest legal document version by user id ', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const latestDocument = databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_ORGA, type: TOS });
      await databaseBuilder.commit();

      // when
      await legalDocumentsApi.acceptLegalDocumentByUserId({ service: PIX_ORGA, userId, type: TOS });

      // then
      const userAcceptance = await knex('legal-document-version-user-acceptances')
        .where({ userId })
        .where('legalDocumentVersionId', latestDocument.id)
        .first();

      expect(userAcceptance).to.exist;
    });
  });

  describe('#getLegalDocumentStatusByUserId', function () {
    it('returns the legal document status for a user', async function () {
      // given
      sinon.stub(config, 'featureToggles').value({ isLegalDocumentsVersioningEnabled: true });
      const service = PIX_ORGA;
      const type = TOS;
      const user = databaseBuilder.factory.buildUser();
      const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        service,
        type,
        versionAt: new Date('2024-02-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: documentVersion.id,
        acceptedAt: new Date('2024-03-01'),
      });
      await databaseBuilder.commit();

      // when
      const legalDocumentStatus = await legalDocumentsApi.getLegalDocumentStatusByUserId({
        userId: user.id,
        service,
        type,
      });

      // then
      expect(legalDocumentStatus).to.be.an.instanceOf(LegalDocumentStatus);
      expect(legalDocumentStatus).to.deep.equal({
        status: STATUS.ACCEPTED,
        acceptedAt: new Date('2024-03-01'),
        documentPath: 'pix-orga-tos-2024-02-01',
      });
    });
  });
});
