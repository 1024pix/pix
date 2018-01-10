const { describe, it, before, sinon, expect } = require('../../../test-helper');
const Hapi = require('hapi');
const CertificationCourseController = require('../../../../lib/application/certificationCourses/certification-course-controller');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const UserService = require('../../../../lib/domain/services/user-service');
const CertificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answersRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationService = require('../../../../lib/domain/services/certification-service');
const Assessment = require('../../../../lib/domain/models/data/assessment');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');

describe('Unit | Controller | certification-course-controller', function() {

  let server;
  let sandbox;
  let replyStub;
  let codeStub;
  const request = {
    pre: {
      userId: 'userId'
    }
  };
  const certificationCourse = { id: 'CertificationCourseId' };
  const userProfile = [{ id: 'competence1', challenges: [] }];
  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certificationCourses') });
  });

  describe('#save', function() {

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
      sandbox.stub(CertificationCourseRepository, 'save').resolves(certificationCourse);
      sandbox.stub(UserService, 'getProfileToCertify').resolves(userProfile);
      sandbox.stub(CertificationChallengesService, 'saveChallenges').resolves({});
      sandbox.stub(CertificationCourseSerializer, 'serialize').resolves({});

    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call repository to create certification-course with status "started"', function() {
      // when
      const promise = CertificationCourseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseRepository.save);
        sinon.assert.calledWith(CertificationCourseRepository.save, { userId: 'userId', status: 'started' });
      });
    });

    it('should call user Service to get User Certification Profile', function() {
      // when
      const promise = CertificationCourseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(UserService.getProfileToCertify);
      });
    });

    it('should call Certification Course Service to save challenges', function() {
      // when
      const promise = CertificationCourseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationChallengesService.saveChallenges);
        sinon.assert.calledWith(CertificationChallengesService.saveChallenges, userProfile, certificationCourse);
      });
    });

    it('should reply the certification course serialized', function() {
      // when
      const promise = CertificationCourseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseSerializer.serialize);
        sinon.assert.calledWith(CertificationCourseSerializer.serialize, { id: 'CertificationCourseId' });
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 201);
      });
    });

  });

  describe('#getResult', () => {
    const answersByAssessments = [{ challenge: 'challenge1', result: 'ok' }];
    const challengesByCertificationId = [{ challenge: 'challenge1', courseId: '2' }];
    const listOfCompetences = [{
      id: 'competence1',
      courseId: 'course1',
      pixScore: '20',
      challenges: [{ id: 'challenge1' }]
    }];
    const score = 20;
    const request = {
      params: {
        id: 'course_id'
      }
    };
    beforeEach(() => {
      const assessment = new Assessment({ id: 'assessment_id', userId: 'user_id' });
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
      sandbox.stub(assessmentRepository, 'getByCertificationCourseId').resolves(assessment);
      sandbox.stub(answersRepository, 'findByAssessment').resolves(answersByAssessments);
      sandbox.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves(challengesByCertificationId);
      sandbox.stub(UserService, 'getProfileToCertify').resolves(listOfCompetences);
      sandbox.stub(certificationService, 'getResult').resolves(score);

    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Assessment Repository to get Assessment by CertificationCourseId', function() {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessmentRepository.getByCertificationCourseId);
        sinon.assert.calledWith(assessmentRepository.getByCertificationCourseId, 'course_id');
      });
    });

    it('should call Answers Repository to get Answers of certification', function() {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(answersRepository.findByAssessment);
        sinon.assert.calledWith(answersRepository.findByAssessment, 'assessment_id');
      });
    });

    it('should call Certification Challenges Repository to find challenges by certification id', function() {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationChallengesRepository.findByCertificationCourseId);
        sinon.assert.calledWith(certificationChallengesRepository.findByCertificationCourseId, 'course_id');
      });
    });

    it('should call User Service to get ProfileToCertify', function() {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(UserService.getProfileToCertify);
        sinon.assert.calledWith(UserService.getProfileToCertify, 'user_id');
      });
    });

    it('should call certification Service to compute score', function() {
      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationService.getResult);
        sinon.assert.calledWith(certificationService.getResult, answersByAssessments, challengesByCertificationId, listOfCompetences);
      });
    });

    it('should reply the score', function() {

      // when
      const promise = CertificationCourseController.getResult(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledWith(replyStub, score);
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
