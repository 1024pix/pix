import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { certificationCandidateController } from '../../../../../src/certification/session/application/certification-candidate-controller.js';
import { authorization } from '../../../../../lib/application/preHandlers/authorization.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/certification-candidate-route.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST /api/sessions/{id}/certification-candidates', function () {
    const correctAttributes = {
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
      'complementary-certification': { id: 5 },
    };

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
        sinon.stub(certificationCandidateController, 'add').returns('ok');
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
          sinon.stub(certificationCandidateController, 'add').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/sessions/1/certification-candidates', {
            data: {
              attributes: { ...correctAttributes, 'complementary-certification': [] },
              type: 'certification-candidates',
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
          const { errors } = JSON.parse(response.payload);
          expect(errors[0].detail).to.equals('"data.attributes.complementary-certification" must be of type object');
        });
      });

      describe('when there is an unexpected attribute', function () {
        it('should return 400', async function () {
          // given
          sinon.stub(authorization, 'verifySessionAuthorization').returns(true);
          sinon.stub(certificationCandidateController, 'add').returns('ok');
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
