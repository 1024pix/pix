const { sinon } = require('../../../test-helper');
const certificationCourseController = require('../../../../lib/application/certificationCourses/certification-course-controller');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseService = require('../../../../lib/domain/services/certification-course-service');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

const logger = require('../../../../lib/infrastructure/logger');
const Boom = require('boom');

describe('Unit | Controller | certification-course-controller', function() {

  let sandbox;
  let replyStub;
  let codeStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#computeResult', () => {

    const certificationCourseId = 1245;
    const certificationScore = 156;
    const boomResponseForbBadImplementation = { message: 'Bad Implementation' };

    const request = {
      params: {
        id: certificationCourseId
      }
    };

    beforeEach(() => {
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox.stub(certificationService, 'calculateCertificationResultByCertificationCourseId').resolves(certificationScore);
      sandbox.stub(logger, 'error');
      sandbox.stub(Boom, 'badImplementation').returns(boomResponseForbBadImplementation);
    });

    it('should call certification Service to compute score', () => {
      // when
      const promise = certificationCourseController.computeResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationService.calculateCertificationResultByCertificationCourseId);
        sinon.assert.calledWith(certificationService.calculateCertificationResultByCertificationCourseId, certificationCourseId);
      });
    });

    it('should reply the score', () => {
      // when
      const promise = certificationCourseController.computeResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledWith(replyStub, certificationScore);
      });
    });

    context('when the retrieving result is failing', () => {
      it('should log the error', () => {
        // given
        const error = new Error('Unexpected error');
        certificationService.calculateCertificationResultByCertificationCourseId.rejects(error);

        // when
        const promise = certificationCourseController.computeResult(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
        });
      });

      it('should return a bad implementation error', () => {
        // given
        const error = new Error('Unexpected error');
        certificationService.calculateCertificationResultByCertificationCourseId.rejects(error);

        // when
        const promise = certificationCourseController.computeResult(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(replyStub, boomResponseForbBadImplementation);
        });
      });
    });
  });

  describe('#getResult', () => {
    const certificationCourseId = 1;
    const request = {
      params: {
        id: certificationCourseId
      }
    };

    beforeEach(() => {
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
      sandbox.stub(certificationService, 'getCertificationResult').resolves({});
    });

    afterEach(() => {
      sandbox.restore();
    });
    it('should call certification-service to get certification result from database', () => {
      // when
      const promise = certificationCourseController.getResult(request, replyStub);

      //then
      return promise.then(()=> {
        sinon.assert.calledOnce(certificationService.getCertificationResult);
        sinon.assert.calledWith(certificationService.getCertificationResult, certificationCourseId);
      });

    });
  });

  describe('#update', () => {

    const updatedCertificationCourse = new CertificationCourse();

    const JsonAPISavedCertificationCourse = {
      data: {
        type: 'certification',
        attributes: {
          id: '1',
          firstName: 'Phil',
          status: 'rejected'
        }
      }
    };

    beforeEach(() => {
      replyStub = sandbox.stub().returns({ code: codeStub });

      sandbox.stub(certificationSerializer, 'deserialize').resolves();
      sandbox.stub(certificationSerializer, 'serialize').returns(JsonAPISavedCertificationCourse);
      sandbox.stub(Boom, 'notFound');
    });

    const options = {
      method: 'PATCH', url: '/api/certification-courses/1245', payload: {
        data: {
          type: 'certifications',
          attributes: {
            id: '1',
            firstName: 'Phil',
            status: 'rejected'
          }
        }
      }
    };

    it('should deserialize the request payload', () => {
      // given
      sandbox.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      const promise = certificationCourseController.update(options, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationSerializer.deserialize);
      });
    });

    it('should patch certificationCourse data using save method', () => {
      // given
      sandbox.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      const promise = certificationCourseController.update(options, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationCourseService.update);
      });
    });

    context('when certification course was modified', () => {

      beforeEach(() => {
        sandbox.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);
      });

      it('should serialize saved certification course', function() {
        // when
        const promise = certificationCourseController.update(options, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(certificationSerializer.serialize);
          sinon.assert.calledWith(certificationSerializer.serialize, updatedCertificationCourse);
        });
      });

      it('should reply serialized certification course', function() {
        // when
        const promise = certificationCourseController.update(options, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, JsonAPISavedCertificationCourse);
        });

      });

    });

    context('When certification course was not modified', () => {

      beforeEach(() => {
        sandbox.stub(certificationCourseService, 'update').rejects(NotFoundError);
      });

      it('should reply a 404 if no certification where updated', function() {
        // when
        const promise = certificationCourseController.update(options, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(Boom.notFound);
          sinon.assert.calledWith(replyStub, NotFoundError.message);
        });
      });
    });

  });
});
