import sinon from 'sinon';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { PIX_ORGA, PIX_APP } = LegalDocumentService.VALUES;
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

  context('when user has already accepted the legal document', function () {
    it('does not throw an exception', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const document = databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_ORGA, type: TOS });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: document.id,
        acceptedAt: new Date('2024-03-01'),
      });
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
  });

  context('when user must accept a new legal document version', function () {
    it('accepts the new legal document version for a user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const document = databaseBuilder.factory.buildLegalDocumentVersion({
        service: PIX_ORGA,
        type: TOS,
        versionAt: '2024-01-01',
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: document.id,
        acceptedAt: new Date('2024-03-01'),
      });
      const newDocument = databaseBuilder.factory.buildLegalDocumentVersion({
        service: PIX_ORGA,
        type: TOS,
        versionAt: '2025-01-01',
      });
      await databaseBuilder.commit();

      // when
      await usecases.acceptLegalDocumentByUserId({ userId: user.id, service: PIX_ORGA, type: TOS });

      // then
      const userAcceptance = await knex('legal-document-version-user-acceptances')
        .where('userId', user.id)
        .where('legalDocumentVersionId', newDocument.id)
        .first();
      expect(userAcceptance).to.exist;
    });
  });

  context('when no legal document is found', function () {
    it('logs an error', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
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

  context('when accepting TOS for PIX_APP service (legacy)', function () {
    it('updates the user table with acceptPixLastTermsOfService and creates legal document acceptance', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ lastTermsOfServiceValidatedAt: null, cgu: false });
      const document = databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_APP, type: TOS });
      await databaseBuilder.commit();

      // when
      await usecases.acceptLegalDocumentByUserId({ userId: user.id, service: PIX_APP, type: TOS });

      // then
      // Verify the user table was updated (legacy behavior)
      const updatedUser = await knex('users').where({ id: user.id }).first();
      expect(updatedUser.lastTermsOfServiceValidatedAt).to.exist;
      expect(updatedUser.cgu).to.be.true;
      expect(updatedUser.mustValidateTermsOfService).to.be.false;

      // Verify the legal document acceptance was created
      const userAcceptance = await knex('legal-document-version-user-acceptances')
        .where('userId', user.id)
        .where('legalDocumentVersionId', document.id)
        .first();
      expect(userAcceptance).to.exist;
    });
  });
});
