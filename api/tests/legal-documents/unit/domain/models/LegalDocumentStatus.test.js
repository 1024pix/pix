import { LegalDocument } from '../../../../../src/legal-documents/domain/models/LegalDocument.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentStatus, STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { expect } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Unit | Legal documents | Domain | Model | LegalDocumentStatus', function () {
  describe('#LegalDocumentStatus.buildForLegacyPixOrgaCgu', function () {
    context('when the user has accepted the Pix Orga CGU', function () {
      it('returns an "accepted" legal document status', function () {
        // given
        const acceptedAt = new Date('2024-01-01');
        const userPixOrgaCgu = {
          pixOrgaTermsOfServiceAccepted: true,
          lastPixOrgaTermsOfServiceValidatedAt: acceptedAt,
        };

        // when
        const legalDocumentStatus = LegalDocumentStatus.buildForLegacyPixOrgaCgu(userPixOrgaCgu);

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.ACCEPTED,
          acceptedAt: acceptedAt,
          documentPath: 'pix-orga-tos-2024-01-02',
        });
      });
    });

    context('when the user has not accepted the Pix Orga CGU', function () {
      it('returns a "requested" legal document status', function () {
        // given
        const userPixOrgaCgu = {
          pixOrgaTermsOfServiceAccepted: false,
          lastPixOrgaTermsOfServiceValidatedAt: null,
        };

        // when
        const legalDocumentStatus = LegalDocumentStatus.buildForLegacyPixOrgaCgu(userPixOrgaCgu);

        // then
        expect(legalDocumentStatus).to.be.instanceof(LegalDocumentStatus);
        expect(legalDocumentStatus).to.deep.equal({
          status: STATUS.REQUESTED,
          acceptedAt: null,
          documentPath: 'pix-orga-tos-2024-01-02',
        });
      });
    });
  });

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
});
