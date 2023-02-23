const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');
const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const moduleUnderTest = require('../../../../lib/application/assessments');

describe('Integration | Application | Assessments | assessment-controller', function () {
  let assessment;

  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'getAssessment');
    sinon.stub(assessmentAuthorization, 'verify');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
    assessment = domainBuilder.buildAssessment();
  });

  describe('#get', function () {
    context('Success cases', function () {
      beforeEach(function () {
        assessmentAuthorization.verify.resolves(assessment);
      });

      it('should resolve a 200 HTTP response', async function () {
        // given
        usecases.getAssessment.resolves(assessment);

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async function () {
        // given
        usecases.getAssessment.resolves(assessment);

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.result.data.type).to.equal('assessments');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        beforeEach(function () {
          assessmentAuthorization.verify.callsFake((request, h) => {
            return h.response({ some: 'error' }).code(401).takeover();
          });
        });

        it('should resolve a 401 HTTP response', async function () {
          // when
          const response = await httpTestServer.request('GET', '/api/assessments/1234');

          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
