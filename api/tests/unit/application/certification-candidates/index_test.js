const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const certificationCandidateController = require('../../../../lib/application/certification-candidates/certification-candidates-controller');
const route = require('../../../../lib/application/certification-candidates');

describe('Unit | Application | Certification Candidates | Routes', () => {
  let server;

  beforeEach(() => {
    // given
    server = this.server = Hapi.server();
  });

  describe('GET /api/certification-candidates/{id}', () => {

    beforeEach(() => {
      // given
      sinon.stub(certificationCandidateController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'GET', url: '/api/certification-candidates/{id}' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/certification-candidates', () => {

    beforeEach(() => {
      // given
      sinon.stub(certificationCandidateController, 'save').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'POST', url: '/api/certification-candidates' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });
});
