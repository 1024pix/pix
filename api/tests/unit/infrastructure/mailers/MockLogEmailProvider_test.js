const { sinon, expect } = require('../../../test-helper');
const MockLogEmailProvider = require('../../../../lib/infrastructure/mailers/MockLogEmailProvider');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Class | MockLogEmailProvider', function() {

  describe('#sendEmail', () => {

    it('should log options to fake email sending', async () => {
      // given
      const options = {
        some: 'email',
        options: 'to-fake',
      };
      sinon.spy(logger, 'info');
      const mailingProvider = new MockLogEmailProvider();

      // when
      await mailingProvider.sendEmail(options);

      // then
      expect(logger.info).to.be.calledWith(`Faking email sending - ${JSON.stringify(options)}`);
    });

  });
});
