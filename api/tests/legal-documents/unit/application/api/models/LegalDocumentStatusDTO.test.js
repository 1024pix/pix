import { expect } from 'chai';

import { LegalDocumentStatusDTO } from '../../../../../../src/legal-documents/application/api/models/LegalDocumentStatusDTO.js';
import { STATUS } from '../../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';

describe('Unit | Legal documents | Application | Api | Model | LegalDocumentStatusDTO', function () {
  describe('#constructor', function () {
    it('assigns status, acceptedAt and documentPath from the given params', function () {
      // given
      const acceptedAt = new Date('2024-01-01');

      // when
      const legalDocumentStatusDTO = new LegalDocumentStatusDTO({
        status: STATUS.ACCEPTED,
        acceptedAt,
        documentPath: 'pix-orga-tos-2024-01-01',
      });

      // then
      expect(legalDocumentStatusDTO.status).to.equal(STATUS.ACCEPTED);
      expect(legalDocumentStatusDTO.acceptedAt).to.equal(acceptedAt);
      expect(legalDocumentStatusDTO.documentPath).to.equal('pix-orga-tos-2024-01-01');
    });
  });

  describe('#isAccepted', function () {
    it('returns true when status is "accepted"', function () {
      // given
      const legalDocumentStatusDTO = new LegalDocumentStatusDTO({
        status: STATUS.ACCEPTED,
        acceptedAt: new Date('2024-01-01'),
        documentPath: null,
      });

      // when / then
      expect(legalDocumentStatusDTO.isAccepted).to.be.true;
    });

    [STATUS.REQUESTED, STATUS.UPDATE_REQUESTED, STATUS.NOT_APPLICABLE].forEach((status) => {
      it(`returns false when status is "${status}"`, function () {
        // given
        const legalDocumentStatusDTO = new LegalDocumentStatusDTO({ status, acceptedAt: null, documentPath: null });

        // when / then
        expect(legalDocumentStatusDTO.isAccepted).to.be.false;
      });
    });
  });
});
