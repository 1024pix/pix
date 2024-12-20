import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal documents | Domain | Use case | accept-legal-document-by-user-id', function () {
  it('accepts the lastest legal document version for a user', async function () {
    // given
    const user = databaseBuilder.factory.buildUser();
    databaseBuilder.factory.buildLegalDocumentVersion({
      type: TOS,
      service: PIX_ORGA,
      versionAt: new Date('2021-01-01'),
    });
    const document = databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_ORGA, type: TOS });
    await databaseBuilder.commit();

    // when
    await usecases.acceptLegalDocumentByUserId({ userId: user.id, service: PIX_ORGA, type: TOS });

    // then
    const userAcceptance = await knex('legal-document-version-user-acceptances')
      .where('userId', user.id)
      .where('legalDocumentVersionId', document.id)
      .first();
    expect(userAcceptance).to.exist;
  });

  context('when the legal document is the Terms of Service for Pix Orga', function () {
    it('accepts the Pix Orga CGUs in the legacy and legal document model', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ pixOrgaTermsOfServiceAccepted: false });
      databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_ORGA, type: TOS });

      await databaseBuilder.commit();

      // when
      await usecases.acceptLegalDocumentByUserId({ userId: user.id, service: PIX_ORGA, type: TOS });

      // then
      const updatedUser = await knex('users').where('id', user.id).first();
      expect(updatedUser.pixOrgaTermsOfServiceAccepted).to.equal(true);
    });

    it('logs an error, when no legal document is found', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ pixOrgaTermsOfServiceAccepted: false });
      const loggerStub = { warn: sinon.stub() };
      await databaseBuilder.commit();

      // when
      await usecases.acceptLegalDocumentByUserId({ userId: user.id, service: PIX_ORGA, type: TOS, logger: loggerStub });

      // then
      expect(loggerStub.warn).to.have.been.calledWith(
        `No legal document found for service: ${PIX_ORGA} and type: ${TOS}`,
      );
    });
  });
});
