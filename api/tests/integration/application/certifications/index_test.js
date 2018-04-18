const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const certificationController = require('../../../../lib/application/certifications/certification-controller');

describe('Integration | Application | Route | Certifications', function() {

  let server;

  beforeEach(() => {
    sinon.stub(certificationController, 'findUserCertifications').callsFake((request, reply) => reply('ok'));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certifications') });
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET /api/certifications', function() {

    it('should exist', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });

    });
  });
});
