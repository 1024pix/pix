const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const certificationController = require('../../../../lib/application/certifications/certification-controller');

describe('Integration | Application | Route | Certifications', () => {

  let server;

  beforeEach(() => {
    sinon.stub(certificationController, 'findUserCertifications').callsFake((request, reply) => reply('ok'));
    sinon.stub(certificationController, 'updateCertification').callsFake((request, reply) => reply('ok').code(204));
    sinon.stub(certificationController, 'getCertification').callsFake((request, reply) => reply('ok').code(200));
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certifications') });
  });

  afterEach(() => {
    certificationController.findUserCertifications.restore();
    certificationController.updateCertification.restore();
    certificationController.getCertification.restore();
    securityController.checkUserHasRolePixMaster.restore();

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

  describe('PATCH /api/certifications/:id', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/certifications/1',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
