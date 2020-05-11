const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityController = require('../../../../lib/application/security-controller');
const certificationController = require('../../../../lib/application/certifications/certification-controller');

describe('Integration | Application | Route | Certifications', () => {

  let server;

  beforeEach(() => {
    sinon.stub(certificationController, 'findUserCertifications').returns('ok');
    sinon.stub(certificationController, 'getCertification').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    server = Hapi.server();
    return server.register(require('../../../../lib/application/certifications'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET /api/certifications', () => {

    it('should exist', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/certifications/:id', () => {

    it('should exist', function() {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications/1',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
