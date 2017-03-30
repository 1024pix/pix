const {describe, it, expect, sinon} = require('../../test-helper');
const Mailjet = require('../../../lib/infrastructure/mailjet');

describe('Unit | Class | Mailjet', function () {

  describe('#sendWelcomeEmail', function () {
    const mjSuccessfullData = {
      response: {
        statusCode: 200
      }
    };

    const mjUnsuccessfullData = {
      response: {
        statusCode: 400
      }
    };

    it('should return an object data and be ok when receiver email is provided', function (done) {
      //Given
      sinon.stub(Mailjet, 'sendWelcomeEmail', _ => mjSuccessfullData);
      // when
      const result = Mailjet.sendWelcomeEmail('flo@pix.com');
      //Then
      expect(result).to.be.an('object');
      expect(result.response.statusCode).to.be.ok;
      Mailjet.sendWelcomeEmail.restore();
      done();
    });

    it('should be nok when bad request', function (done) {
      //Given
      sinon.stub(Mailjet, 'sendWelcomeEmail', _ => mjUnsuccessfullData);
      // when
      const result = Mailjet.sendWelcomeEmail('');

      //Then
      expect(result).to.be.an('object');
      expect(result.response.statusCode).to.be.falsy;
      Mailjet.sendWelcomeEmail.restore();
      done();
    });
  });
});
