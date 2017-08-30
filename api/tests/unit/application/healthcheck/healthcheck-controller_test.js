const { describe, it, expect, sinon } = require('../../../test-helper');
const healthcheckRepository = require('../../../../lib/infrastructure/repositories/healthcheck-repository');

const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Controller | healthcheckController', () => {

  describe('#get', () => {
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

  describe('#getDbStatus', () => {

    beforeEach(() => {
      sinon.stub(healthcheckRepository, 'check');
    });

    afterEach(() => {
      healthcheckRepository.check.restore();
    });

    it('should check if DB connection is successful', () => {
      // given
      const replySpy = sinon.spy();
      healthcheckRepository.check.resolves();

      // when
      const promise = healthcheckController.getDbStatus(null, replySpy);

      // then
      return promise.then(() => {
        const callArguments = replySpy.firstCall.args[0];
        expect(callArguments).to.include.keys('message');
        expect(callArguments['message']).to.equal('Connection to database ok');
      });
    });

    it('should reply with a 503 error when the connection with the database is KO', () => {
      // given
      const replySpy = sinon.spy();
      healthcheckRepository.check.rejects();

      // when
      const promise = healthcheckController.getDbStatus(null, replySpy);

      // then
      return promise.then(() => {
        const callArguments = replySpy.firstCall.args[0];
        expect(callArguments['message']).to.equal('Connection to database failed');
      });
    });
  });

});
