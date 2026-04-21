import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import * as userAcceptanceRepository from '../../../../../src/legal-documents/infrastructure/repositories/user-acceptance.repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

const { PIX_ORGA, PIX_CERTIF } = LegalDocumentService.VALUES;
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
    it('finds the last user acceptance record for a legal document type and service', async function () {
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

  describe('#findByLegalDocumentVersionId', function () {
    it('finds the last user acceptance record for a legal document id', async function () {
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
      const userAcceptance = await userAcceptanceRepository.findByLegalDocumentVersionId({
        userId: user.id,
        legalDocumentVersionId: newDocumentVersion.id,
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
        const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({ type: TOS, service: PIX_ORGA });
        await databaseBuilder.commit();

        // when
        const userAcceptance = await userAcceptanceRepository.findByLegalDocumentVersionId({
          userId: user.id,
          legalDocumentVersionId: documentVersion.id,
        });

        // then
        expect(userAcceptance).to.be.null;
      });
    });
  });

  describe('#findByUserId', function () {
    it('returns legal document version user acceptances of the given user', async function () {
      // given
      const legalDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_ORGA,
        versionAt: new Date('2024-02-01'),
      });

      const user = databaseBuilder.factory.buildUser();
      const userAcceptanceId = databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: legalDocumentVersion.id,
        acceptedAt: new Date('2024-03-01'),
      }).id;

      const user2 = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user2.id,
        legalDocumentVersionId: legalDocumentVersion.id,
        acceptedAt: new Date('2024-03-01'),
      });

      await databaseBuilder.commit();

      // when
      const userAcceptances = await userAcceptanceRepository.findByUserId(user.id);

      // then
      expect(userAcceptances).to.have.length(1);
      expect(userAcceptances[0].id).to.equal(userAcceptanceId);
    });
  });

  describe('#update', function () {
    it('updates the legal document version user acceptance corresponding to the given id', async function () {
      // given
      const legalDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_ORGA,
        versionAt: new Date('2024-03-01'),
      });

      const user = databaseBuilder.factory.buildUser();
      const userAcceptanceId = databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user.id,
        legalDocumentVersionId: legalDocumentVersion.id,
        acceptedAt: new Date('2024-03-01'),
      }).id;

      await databaseBuilder.commit();

      // when
      await userAcceptanceRepository.update({
        id: userAcceptanceId,
        acceptedAt: new Date('2025-03-01'),
      });

      // then
      const userAcceptance = await knex('legal-document-version-user-acceptances')
        .where({ id: userAcceptanceId })
        .first();
      expect(userAcceptance.acceptedAt.toISOString()).to.equal('2025-03-01T00:00:00.000Z');
    });
  });

  describe('#removeAllByUserId', function () {
    it('deletes all legal user acceptances of user', async function () {
      // given
      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();
      const legalDocumentVersion1 = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_ORGA,
        versionAt: new Date('2024-03-01'),
      });
      const legalDocumentVersion2 = databaseBuilder.factory.buildLegalDocumentVersion({
        type: TOS,
        service: PIX_CERTIF,
        versionAt: new Date('2024-03-01'),
      });

      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user1.id,
        legalDocumentVersionId: legalDocumentVersion1.id,
        acceptedAt: new Date('2024-03-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user1.id,
        legalDocumentVersionId: legalDocumentVersion2.id,
        acceptedAt: new Date('2024-03-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user2.id,
        legalDocumentVersionId: legalDocumentVersion1.id,
        acceptedAt: new Date('2024-03-01'),
      });
      databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
        userId: user2.id,
        legalDocumentVersionId: legalDocumentVersion2.id,
        acceptedAt: new Date('2024-03-01'),
      });
      await databaseBuilder.commit();

      // when
      await userAcceptanceRepository.removeAllByUserId(user1.id);

      // then
      const userAcceptance1 = await knex('legal-document-version-user-acceptances').where({ userId: user1.id }).first();
      expect(userAcceptance1).to.be.undefined;
      const userAcceptance2 = await knex('legal-document-version-user-acceptances').where({ userId: user2.id }).first();
      expect(userAcceptance2).to.exist;
    });
  });
});
