const { sinon, expect, HttpTestServer } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const certificationController = require('../../../../lib/application/certifications/certification-controller');
const moduleUnderTest = require('../../../../lib/application/certifications');

describe('Unit | Application | Certification | Routes', () => {

  context('POST /api/admin/certification/neutralize-challenge', () => {

    it('rejects access if the logged user is not a Pix Master', async () => {
      // given
      sinon.stub(certificationController, 'neutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('checks that a valid certification-course id is given', async () => {
      // given
      sinon.stub(certificationController, 'neutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 'invalide',
            challengeRecId: 'rec43mpMIR5dUzdjh',
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('checks that a challenge recId is given', async() => {
      // given
      sinon.stub(certificationController, 'neutralizeChallenge').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            certificationCourseId: 1,
            challengeRecId: null,
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification/neutralize-challenge', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
