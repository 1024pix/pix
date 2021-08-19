const { expect } = require('../../../test-helper');
const MailingProvider = require('../../../../lib/infrastructure/mailers/MailingProvider');

describe('Unit | Infrastructure | Mailers | MailingProvider', function() {

  describe('#sendEmail', function() {

    it('should reject an error (because this class actually mocks an interface)', function() {
      // given
      const mailingProvider = new MailingProvider();

      // when
      const result = mailingProvider.sendEmail({});

      // then
      return expect(result).to.be.rejected;
    });
  });

});
