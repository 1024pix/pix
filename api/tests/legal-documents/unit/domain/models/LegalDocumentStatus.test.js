import { LegalDocument } from '../../../../../src/legal-documents/domain/models/LegalDocument.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { expect } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Unit | Legal documents | Domain | Model | LegalDocumentStatus', function () {
  describe('#LegalDocumentStatus.build', function () {
    context('when the user has accepted the last document version', function () {
      it('returns an "accepted" legal document status', function () {
        // given
        const lastDocumentVersion = new LegalDocument({
          id: 'last-document-version-id',
          type: TOS,
          service: PIX_ORGA,
          versionAt: new Date('2024-01-01'),
        });
        const acceptedAt = new Date('2024-01-01');
        const lastUserAcceptance = { legalDocumentVersionId: lastDocumentVersion.id, acceptedAt };

        // when
        const legalDocumentStatus = LegalDocumentStatus.build(lastDocumentVersion, lastUserAcceptance);

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.ACCEPTED,
          acceptedAt,
          documentPath: 'pix-orga-tos-2024-01-01',
        });
      });
    });

    context('when the user has not accepted the current document version', function () {
      it('returns a "requested" legal document status', function () {
        // given
        const lastDocumentVersion = new LegalDocument({
          id: 'last-document-version-id',
          type: TOS,
          service: PIX_ORGA,
          versionAt: new Date('2024-01-01'),
        });
        const lastUserAcceptance = null;

        // when
        const legalDocumentStatus = LegalDocumentStatus.build(lastDocumentVersion, lastUserAcceptance);

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.REQUESTED,
          acceptedAt: null,
          documentPath: 'pix-orga-tos-2024-01-01',
        });
      });
    });

    context('when the user has accepted a previous document version', function () {
      it('returns an "update-requested" legal document status', function () {
        // given
        const lastDocumentVersion = new LegalDocument({
          id: 'last-document-version-id',
          type: TOS,
          service: PIX_ORGA,
          versionAt: new Date('2024-01-01'),
        });
        const acceptedAt = new Date('2024-01-01');
        const lastUserAcceptance = { legalDocumentVersionId: 'previous-document-version-id', acceptedAt };

        // when
        const legalDocumentStatus = LegalDocumentStatus.build(lastDocumentVersion, lastUserAcceptance);

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.UPDATE_REQUESTED,
          acceptedAt: null,
          documentPath: 'pix-orga-tos-2024-01-01',
        });
      });
    });
  });

  describe('#LegalDocumentStatus.buildForLegacyPixAppCgu', function () {
    context('when the user has accepted CGU and must validate terms of service', function () {
      it('returns an "update-requested" legal document status', function () {
        // given / when
        const legalDocumentStatus = LegalDocumentStatus.buildForLegacyPixAppCgu({
          mustValidateTermsOfService: true,
          lastTermsOfServiceValidatedAt: new Date('2024-01-01'),
        });

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.UPDATE_REQUESTED,
          acceptedAt: null,
          documentPath: null,
        });
      });
    });

    context('when the user has accepted CGU and does not need to revalidate', function () {
      it('returns an "accepted" legal document status with lastTermsOfServiceValidatedAt as "acceptedAt"', function () {
        // given
        const lastTermsOfServiceValidatedAt = new Date('2024-06-15');

        // when
        const legalDocumentStatus = LegalDocumentStatus.buildForLegacyPixAppCgu({
          mustValidateTermsOfService: false,
          lastTermsOfServiceValidatedAt,
        });

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.ACCEPTED,
          acceptedAt: lastTermsOfServiceValidatedAt,
          documentPath: null,
        });
      });
    });
  });

  describe('#LegalDocumentStatus.notFound', function () {
    it('returns an legal document status as request when legal document is not found', function () {
      // given / when
      const legalDocumentStatus = LegalDocumentStatus.notFound();

      // then
      expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
      expect(legalDocumentStatus).to.deep.equal({ status: STATUS.REQUESTED, acceptedAt: null, documentPath: null });
    });
  });
});
