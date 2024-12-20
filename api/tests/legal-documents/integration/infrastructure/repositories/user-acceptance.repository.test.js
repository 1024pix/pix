import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import * as userAcceptanceRepository from '../../../../../src/legal-documents/infrastructure/repositories/user-acceptance.repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal document | Infrastructure | Repository | user-acceptance', function () {
  describe('#create', function () {
    it('creates an acceptance record for a user and legal document', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const document = databaseBuilder.factory.buildLegalDocumentVersion({ type: TOS, service: PIX_ORGA });
      await databaseBuilder.commit();

      // when
      await userAcceptanceRepository.create({ userId: user.id, legalDocumentVersionId: document.id });

      // then
      const userAcceptance = await knex('legal-document-version-user-acceptances')
        .where('userId', user.id)
        .where('legalDocumentVersionId', document.id)
        .first();
      expect(userAcceptance.acceptedAt).to.be.a('date');
    });
  });

  describe('#findLastForLegalDocument', function () {
    it('finds the last user acceptance record for a legal document type and service.', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const oldDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_ORGA,
        versionAt: new Date('2023-01-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: oldDocumentVersion.id,
        acceptedAt: new Date('2023-02-01'),
      });
      const newDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_ORGA,
        versionAt: new Date('2024-02-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: newDocumentVersion.id,
        acceptedAt: new Date('2024-03-01'),
      });
      await databaseBuilder.commit();

      // when
      const userAcceptance = await userAcceptanceRepository.findLastForLegalDocument({
        userId: user.id,
        type: TOS,
        service: PIX_ORGA,
      });

      // then
      expect(userAcceptance.legalDocumentVersionId).to.equal(newDocumentVersion.id);
      expect(userAcceptance.userId).to.equal(user.id);
      expect(userAcceptance.acceptedAt).to.deep.equal(new Date('2024-03-01'));
    });

    context('when user has not accepted the document', function () {
      it('returns null', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildLegalDocumentVersion({ type: TOS, service: PIX_ORGA });
        await databaseBuilder.commit();

        // when
        const userAcceptance = await userAcceptanceRepository.findLastForLegalDocument({
          userId: user.id,
          type: TOS,
          service: PIX_ORGA,
        });

        // then
        expect(userAcceptance).to.be.null;
      });
    });

    context('when the document does not exist', function () {
      it('returns null', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        // when
        const userAcceptance = await userAcceptanceRepository.findLastForLegalDocument({
          userId: user.id,
          type: TOS,
          service: PIX_ORGA,
        });

        // then
        expect(userAcceptance).to.be.null;
      });
    });

    context('when the user does not exist', function () {
      it('returns null', async function () {
        // given
        databaseBuilder.factory.buildLegalDocumentVersion({ type: TOS, service: PIX_ORGA });
        await databaseBuilder.commit();

        // when
        const userAcceptance = await userAcceptanceRepository.findLastForLegalDocument({
          userId: 123,
          type: TOS,
          service: PIX_ORGA,
        });

        // then
        expect(userAcceptance).to.be.null;
      });
    });
  });
});
