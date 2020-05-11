const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Route | AssessmentRoute', () => {

  let server;

  function _expectRouteToExist(routeOptions) {
    // when
    const promise = server.inject(routeOptions);

    // then
    return promise.then((res) => {
      expect(res.statusCode).to.equal(200);
    });
  }

  beforeEach(() => {
    // stub dependencies
    sinon.stub(assessmentController, 'save');
    sinon.stub(assessmentController, 'getNextChallenge');
    sinon.stub(assessmentController, 'findByFilters');
    sinon.stub(assessmentController, 'get');
    sinon.stub(assessmentAuthorization, 'verify');
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');

    // instance server
    server = this.server = Hapi.server();

    return server.register(require('../../../../lib/application/assessments'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/assessments', () => {

    beforeEach(() => {
      assessmentController.save.returns('ok');
    });

    it('should exist', () => {
      return _expectRouteToExist({ method: 'POST', url: '/api/assessments' });
    });
  });

  describe('GET /api/assessments/assessment_id/next', () => {

    beforeEach(() => {
      assessmentController.getNextChallenge.returns('ok');
    });

    it('should exist', () => {
      return _expectRouteToExist({ method: 'GET', url: '/api/assessments/assessment_id/next' });
    });
  });

  describe('GET /api/assessments', () => {

    beforeEach(() => {
      assessmentController.findByFilters.returns('ok');
    });

    it('should exist', () => {
      return _expectRouteToExist({ method: 'GET', url: '/api/assessments' });
    });
  });

  describe('GET /api/assessments/{id}', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/assessments/assessment_id'
      };

      assessmentController.get.returns('ok');
      assessmentAuthorization.verify.returns('userId');
    });

    it('should exist', () => {
      return _expectRouteToExist(options);
    });

    it('should call pre-handler', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(() => {
        sinon.assert.called(assessmentAuthorization.verify);
      });
    });
  });
});
