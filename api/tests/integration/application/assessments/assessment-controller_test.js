const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const { NotFoundError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/assessments');

describe('Integration | Application | Assessments | assessment-controller', () => {

  const assessment = domainBuilder.buildAssessment({ id: 1234 });

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'getAssessment');
    sinon.stub(assessmentAuthorization, 'verify');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#get', () => {

    context('Success cases', () => {

      beforeEach(() => {
        assessmentAuthorization.verify.resolves(assessment);
      });

      it('should resolve a 200 HTTP response', async () => {
        // given
        usecases.getAssessment.resolves(assessment);

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async () => {
        // given
        usecases.getAssessment.resolves(assessment);

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.result.data.type).to.equal('assessment');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          assessmentAuthorization.verify.callsFake((request, h) => {
            return h.response({ some: 'error' }).code(401).takeover();
          });
        });

        it('should resolve a 401 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', '/api/assessments/1234');

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when user is allowed to access resource', () => {

        beforeEach(() => {
          assessmentAuthorization.verify.resolves(assessment);
        });

        it('should resolve a 404 HTTP response when assessment does not exist', async () => {
          // given
          const error = new NotFoundError('Assessment not found');
          usecases.getAssessment.rejects(error);

          // when
          const response = await httpTestServer.request('GET', '/api/assessments/1234');

          // then
          expect(response.statusCode).to.equal(404);
        });

        it('should resolve a 500 HTTP response when an unexpected exception occurred', async () => {
          // given
          usecases.getAssessment.rejects(new Error());

          // when
          const response = await httpTestServer.request('GET', '/api/assessments/1234');

          // then
          expect(response.statusCode).to.equal(500);
          expect(response.result.errors[0].code).to.equal('500');
        });
      });
    });
  });
});
