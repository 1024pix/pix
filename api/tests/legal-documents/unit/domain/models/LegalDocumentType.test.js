import Joi from 'joi';

import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';

describe('Unit | Legal documents | Domain | Model | LegalDocumentType', function () {
  describe('VALUES', function () {
    it('has correct values', function () {
      expect(LegalDocumentType.VALUES.TOS).to.equal('TOS');
    });
  });

  describe('assert', function () {
    it('does not throw an error for valid value', function () {
      expect(() => LegalDocumentType.assert('TOS')).to.not.throw();
    });

    it('throws an error for invalid value', function () {
      expect(() => LegalDocumentType.assert('INVALID')).to.throw(Joi.ValidationError);
    });
  });
});
