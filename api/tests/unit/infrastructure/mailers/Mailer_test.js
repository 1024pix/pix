const { expect } = require('../../../test-helper');
const Mailer = require('../../../../lib/infrastructure/mailers/Mailer');

describe('Unit | Infrastructure | Mailers | Mailer', () => {

  const mailInstance = new Mailer();

  describe('#sendEmail', () => {

    it('should reject an error (because this class actually mocks an interface)', () => {
      // when
      const result = mailInstance.sendEmail('options', () => {});

      // then
      expect(result).to.be.rejected;
    });
  });
});
