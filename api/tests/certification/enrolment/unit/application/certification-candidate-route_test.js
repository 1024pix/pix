import { certificationCandidateController } from '../../../../../src/certification/enrolment/application/certification-candidate-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/enrolment/application/certification-candidate-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { SUBSCRIPTION_TYPES } from '../../../../../src/certification/shared/domain/constants.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST /api/sessions/{sessionId}/certification-candidates', function () {
    let correctAttributes;

    beforeEach(function () {
      correctAttributes = {
        'first-name': 'prenom',
        'last-name': 'nom',
        birthdate: '2000-01-01',
        'birth-city': null,
        'birth-province-code': null,
        'birth-country': 'FRANCE',
        'birth-postal-code': null,
        'birth-insee-code': '75115',
        email: 'guybrush.threepwood@example.net',
        'result-recipient-email': 'theotherone@example.net',
        'external-id': '44AA3355',
        'extra-time-percentage': 0.15,
        'organization-learner-id': null,
        sex: 'F',
        'billing-mode': 'FREE',
        'prepayment-code': null,
        subscriptions: [{ complementaryCertificationId: 5, type: SUBSCRIPTION_TYPES.COMPLEMENTARY }],
      };
    });

    describe('when the payload is correct', function () {
      it('should return 404 if the user is not authorized on the session', async function () {
        // given
        sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('POST', '/api/sessions/3/certification-candidates', {
          data: { attributes: correctAttributes, type: 'certification-candidates' },
        });

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should return 200', async function () {
        // given
        sinon.stub(authorization, 'verifySessionAuthorization').returns(true);
        sinon.stub(certificationCandidateController, 'addCandidate').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/sessions/1/certification-candidates', {
          data: {
            attributes: correctAttributes,
            type: 'certification-candidates',
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('when the payload is incorrect', function () {
      describe('when an attribute has wrong type', function () {
        it('should return 400', async function () {
          // given
          sinon.stub(authorization, 'verifySessionAuthorization').returns(true);
          sinon.stub(certificationCandidateController, 'addCandidate').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/sessions/1/certification-candidates', {
            data: {
              attributes: { ...correctAttributes, sex: [] },
              type: 'certification-candidates',
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
          const { errors } = JSON.parse(response.payload);
          expect(errors[0].detail).to.equals('"data.attributes.sex" must be a string');
        });
      });

      describe('when there is an unexpected attribute', function () {
        it('should return 400', async function () {
          // given
          sinon.stub(authorization, 'verifySessionAuthorization').returns(true);
          sinon.stub(certificationCandidateController, 'addCandidate').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/sessions/1/certification-candidates', {
            data: {
              attributes: { ...correctAttributes, toto: 3 },
              type: 'certification-candidates',
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
          const { errors } = JSON.parse(response.payload);
          expect(errors[0].detail).to.equals('"data.attributes.toto" is not allowed');
        });
      });
    });
  });

  describe('GET /api/sessions/{sessionId}/certification-candidates', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(certificationCandidateController, 'getEnrolledCandidates').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/sessions/{sessionId}/certification-candidates/{certificationCandidateId}', function () {
    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(certificationCandidateController, 'deleteCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates/1');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return an error if certification candidate id is incorrect', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(certificationCandidateController, 'deleteCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates/ID');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/certification-candidates/{certificationCandidateId}/validate-certification-instructions', function () {
    describe('when the user is not authorized', function () {
      it('should return 403', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserIsCandidate').callsFake((request, h) =>
          h
            .response({ errors: new Error('forbidden') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request(
          'PATCH',
          '/api/certification-candidates/3/validate-certification-instructions',
        );

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsCandidate').returns(true);
      sinon.stub(certificationCandidateController, 'validateCertificationInstructions').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'PATCH',
        '/api/certification-candidates/3/validate-certification-instructions',
      );
      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/sessions/{sessionId}/certification-candidates/{certificationCandidateId}', function () {
    const method = 'PATCH';

    it('should return 204', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon
        .stub(certificationCandidateController, 'updateEnrolledCandidate')
        .callsFake((_, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const id = 123;
      const certificationCandidateId = 456;
      const url = `/api/sessions/${id}/certification-candidates/${certificationCandidateId}`;
      const payload = {
        data: {
          attributes: {
            'accessibility-adjustment-needed': true,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    context('when the user is not authorized on the session', function () {
      it('should return 404', async function () {
        // given
        sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const id = 123;
        const certificationCandidateId = 456;
        const url = `/api/sessions/${id}/certification-candidates/${certificationCandidateId}`;
        const payload = {
          data: {
            attributes: {
              'accessibility-adjustment-needed': true,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when id params is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const id = 'wrongType';
        const certificationCandidateId = 456;
        const url = `/api/sessions/${id}/certification-candidates/${certificationCandidateId}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when certificationCandidateId params is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const id = 123;
        const certificationCandidateId = 'wrongType';
        const url = `/api/sessions/${id}/certification-candidates/${certificationCandidateId}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the payload is incorrect', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const id = 123;
        const certificationCandidateId = 456;
        const url = `/api/sessions/${id}/certification-candidates/${certificationCandidateId}`;
        const payload = {
          accessibilityAdjustmentNeeded: 'wrongType',
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('id validation', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        condition: 'session ID params is not a number',
        request: { method: 'POST', url: '/api/sessions/salut/certification-candidates' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'POST', url: '/api/sessions/9999999999/certification-candidates' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'GET', url: '/api/sessions/salut/certification-candidates' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/sessions/9999999999/certification-candidates' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'DELETE', url: '/api/sessions/salut/certification-candidates/1' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'DELETE', url: '/api/sessions/9999999999/certification-candidates/1' },
      },
      {
        condition: 'certification candidate ID params is not a number',
        request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/salut' },
      },
      {
        condition: 'certification candidate ID params is out of range for database integer (> 2147483647)',
        request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/9999999999' },
      },
    ].forEach(({ condition, request }) => {
      it(`should return 400 when ${condition}`, async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(request.method, request.url, request.payload || null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
