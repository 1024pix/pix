const {describe, it, expect, sinon} = require('../../../test-helper');

const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Controller | healthcheckController', () => {

  describe('#get', () => {
    it('should provide get method', () => {
      expect(healthcheckController.get).to.exist;
    });

    it('should reply with the API description', function () {
      // given
      const replySpy = sinon.spy();

      // when
      healthcheckController.get(null, replySpy);

      // then
      const arguments = replySpy.firstCall.args[0];
      expect(arguments).to.include.keys('name', 'version', 'description');
      expect(arguments['name']).to.equal('pix-api');
      expect(arguments['description']).to.equal('Plateforme d\'évaluation et de certification des compétences numériques à l\'usage de tous les citoyens francophones');
    });
  });
});
