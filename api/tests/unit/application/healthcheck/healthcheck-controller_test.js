const { describe, it, expect, sinon } = require('../../../test-helper');

const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Controller | healthcheckController', () => {

  describe('#get', () => {
    it('should provide get method', () => {
      expect(healthcheckController.get).to.exist;
    });

    it('should reply with the API description', function() {
      // given
      const replySpy = sinon.spy();

      // when
      healthcheckController.get(null, replySpy);

      // then
      const callArguments = replySpy.firstCall.args[0];
      expect(callArguments).to.include.keys('name', 'version', 'description');
      expect(callArguments['name']).to.equal('pix-api');
      expect(callArguments['description']).to.equal('Plateforme d\'évaluation et de certification des compétences numériques à l\'usage de tous les citoyens francophones');
      expect(callArguments['environment']).to.equal('test');
    });
  });
});
