import Joi from 'joi';

import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';

describe('Unit | Legal documents | Domain | Model | LegalDocumentService', function () {
  describe('VALUES', function () {
    it('has correct values', function () {
      expect(LegalDocumentService.VALUES.PIX_APP).to.equal('pix-app');
      expect(LegalDocumentService.VALUES.PIX_ORGA).to.equal('pix-orga');
      expect(LegalDocumentService.VALUES.PIX_CERTIF).to.equal('pix-certif');
    });
  });

  describe('#assert', function () {
    it('does not throw an error for valid values', function () {
      expect(() => LegalDocumentService.assert('pix-app')).to.not.throw();
      expect(() => LegalDocumentService.assert('pix-orga')).to.not.throw();
      expect(() => LegalDocumentService.assert('pix-certif')).to.not.throw();
    });

    it('throws an error for invalid values', function () {
      expect(() => LegalDocumentService.assert('invalid-value')).to.throw(Joi.ValidationError);
    });
  });
});
