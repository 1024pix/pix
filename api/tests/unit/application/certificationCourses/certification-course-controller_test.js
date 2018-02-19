const { sinon, expect } = require('../../../test-helper');
const CertificationCourseController = require('../../../../lib/application/certificationCourses/certification-course-controller');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const logger = require('../../../../lib/infrastructure/logger');
const Boom = require('boom');

describe('Unit | Controller | certification-course-controller', function() {

  let sandbox;
  let replyStub;
  let codeStub;

  describe('#getResult', () => {

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

      sandbox = sinon.sandbox.create();
      sandbox.stub(certificationService, 'calculateCertificationResultByCertificationCourseId').resolves(certificationScore);
      sandbox.stub(logger, 'error');
      sandbox.stub(Boom, 'badImplementation').returns(boomResponseForbBadImplementation);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call certification Service to compute score', () => {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationService.calculateCertificationResultByCertificationCourseId);
        sinon.assert.calledWith(certificationService.calculateCertificationResultByCertificationCourseId, certificationCourseId);
      });
    });

    it('should reply the score', () => {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

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
        const promise = CertificationCourseController.getResult(request, replyStub);

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
        const promise = CertificationCourseController.getResult(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(replyStub, boomResponseForbBadImplementation);
        });
      });
    });
  });

  describe('#get', () => {
    let sandbox;

    const certificationId = 12;
    const assessment = { id: 'assessment_id', courseId: 1 };
    const certificationCourse = {
      id: 1,
      userId: 7,
      completed: 'started',
      assessment
    };

    let request;
    let reply;
    const certificationSerialized = { id: certificationId, assessment: { id: 'assessment_id' } };

    beforeEach(() => {
      request = { params: { id: certificationId } };

      sandbox = sinon.sandbox.create();

      reply = sandbox.stub();
      sandbox.stub(assessmentRepository, 'getByCertificationCourseId').resolves(assessment);
      sandbox.stub(CertificationCourseRepository, 'get').resolves(certificationCourse);
      sandbox.stub(certificationCourseSerializer, 'serialize').returns(certificationSerialized);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call assessmentRepository#getByCertificationCourseId with request param', () => {
      // when
      const promise = CertificationCourseController.get(request, reply);

      // then
      return promise.then(() => {
        expect(CertificationCourseRepository.get).to.have.been.calledOnce;
        expect(CertificationCourseRepository.get).to.have.been.calledWith(certificationId);
      });
    });

    it('should reply the certification course serialized', () => {
      // when
      const promise = CertificationCourseController.get(request, reply);

      // then
      return promise.then(() => {
        expect(reply).to.have.been.calledOnce;
        expect(reply).to.have.been.calledWith(certificationSerialized);
      });
    });
  });
});
