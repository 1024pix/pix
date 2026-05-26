import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/legal-documents/domain/usecases/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

const { PIX_APP, PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Legal documents | Domain | Use case | get-legal-document-status-by-user-id', function () {
  afterEach(async function () {
    await featureToggles.set('newPixAppLegalDocumentsVersioning', false);
  });

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

  context('when service is pix-app', function () {
    context('when feature toggle is disabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixAppLegalDocumentsVersioning', false);
      });

      context('when when mustValidateTermsOfService=false', function () {
        it('returns accepted status', async function () {
          // given
          const acceptedAt = new Date('2024-06-01');
          const user = databaseBuilder.factory.buildUser({
            cgu: true,
            mustValidateTermsOfService: false,
            lastTermsOfServiceValidatedAt: acceptedAt,
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result).to.deep.equal({ status: STATUS.ACCEPTED, acceptedAt, documentPath: null });
        });
      });

      context('when mustValidateTermsOfService=true', function () {
        it('returns update-requested status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({
            cgu: true,
            mustValidateTermsOfService: true,
            lastTermsOfServiceValidatedAt: null,
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result).to.deep.equal({ status: STATUS.UPDATE_REQUESTED, acceptedAt: null, documentPath: null });
        });
      });
    });

    context('when feature toggle is enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixAppLegalDocumentsVersioning', true);
      });

      context('when user has no acceptance and is not an SCO student', function () {
        it('returns requested status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2024-01-01'),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result.status).to.equal(STATUS.REQUESTED);
        });
      });

      context('when user has accepted an older version and is not a SCO student', function () {
        it('returns update-requested status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const oldDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2023-01-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2024-01-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
            userId: user.id,
            legalDocumentVersionId: oldDocumentVersion.id,
            acceptedAt: new Date('2023-06-01'),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result.status).to.equal(STATUS.UPDATE_REQUESTED);
        });
      });

      context('when user has no acceptance and is a SCO student', function () {
        it('returns not-applicable status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2024-01-01'),
          });
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          databaseBuilder.factory.buildOrganizationLearner({
            userId: user.id,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result.status).to.equal(STATUS.NOT_APPLICABLE);
        });
      });

      context('when user has an older acceptance and is a SCO student', function () {
        it('returns not-applicable status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser();
          const oldDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2023-01-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2024-01-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
            userId: user.id,
            legalDocumentVersionId: oldDocumentVersion.id,
            acceptedAt: new Date('2023-06-01'),
          });
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          databaseBuilder.factory.buildOrganizationLearner({
            userId: user.id,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result.status).to.equal(STATUS.NOT_APPLICABLE);
        });
      });

      context('when user has accepted the current version even if SCO student', function () {
        it('returns accepted status', async function () {
          // given
          const acceptedAt = new Date('2024-03-01');
          const user = databaseBuilder.factory.buildUser();
          const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
            service: PIX_APP,
            type: TOS,
            versionAt: new Date('2024-01-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
            userId: user.id,
            legalDocumentVersionId: documentVersion.id,
            acceptedAt,
          });
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          databaseBuilder.factory.buildOrganizationLearner({
            userId: user.id,
            organizationId: organization.id,
            createdAt: new Date(),
          });
          await databaseBuilder.commit();

          // when
          const result = await usecases.getLegalDocumentStatusByUserId({
            userId: user.id,
            service: PIX_APP,
            type: TOS,
          });

          // then
          expect(result).to.be.an.instanceOf(LegalDocumentStatus);
          expect(result.status).to.equal(STATUS.ACCEPTED);
        });
      });
    });
  });
});
