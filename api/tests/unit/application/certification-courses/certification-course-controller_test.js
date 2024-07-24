import { certificationCourseController } from '../../../../lib/application/certification-courses/certification-course-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { CertificationCourse } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { domainBuilder, expect, generateValidRequestAuthorizationHeader, hFake, sinon } from '../../../test-helper.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';

describe('Unit | Controller | certification-course-controller', function () {
  let certificationCourseSerializer;
  let juryCertificationSerializer;
  let certifiedProfileSerializer;
  let certifiedProfileRepository;
  let requestResponseUtils;

  beforeEach(function () {
    certificationCourseSerializer = {
      serialize: sinon.stub(),
      serializeFromCertificationCourse: sinon.stub(),
      deserializeCertificationCandidateModificationCommand: sinon.stub(),
    };
    juryCertificationSerializer = {
      serialize: sinon.stub(),
    };
    certifiedProfileSerializer = {
      serialize: sinon.stub(),
    };
    certifiedProfileRepository = {
      get: sinon.stub(),
    };
    requestResponseUtils = { extractLocaleFromRequest: sinon.stub() };
  });

  describe('#getJuryCertification', function () {
    it('should return serialized jury certification returned by the usecase', async function () {
      // given
      const certificationCourseId = 1;
      const request = {
        params: {
          id: certificationCourseId,
        },
        i18n: getI18n(),
      };

      const juryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthplace: 'Torreilles',
        birthdate: '2000-08-30',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'France',
        sex: 'F',
        status: 'rejected',
        isCancelled: false,
        isPublished: true,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
        pixScore: 55,
        juryId: 66,
        commentForCandidate: 'comment candidate',
        commentForOrganization: 'comment organization',
        commentByJury: 'comment jury',
        competenceMarks: [],
        certificationIssueReports: [],
        commonComplementaryCertificationCourseResult: null,
        complementaryCertificationCourseResultWithExternal: null,
      });
      const stubbedUsecase = sinon.stub(usecases, 'getJuryCertification');
      stubbedUsecase.withArgs({ certificationCourseId }).resolves(juryCertification);
      juryCertificationSerializer.serialize.withArgs(juryCertification).returns('ok');

      // when
      const response = await certificationCourseController.getJuryCertification(request, hFake, {
        juryCertificationSerializer,
      });

      // then
      expect(response).to.deep.equal('ok');
    });
  });

  describe('#save', function () {
    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { accessToken: 'jwt.access.token', userId: 'userId' } },
        pre: { userId: 'userId' },
        payload: {
          data: {
            attributes: {
              'access-code': 'ABCD12',
              'session-id': '12345',
            },
          },
        },
      };
      sinon.stub(usecases, 'retrieveLastOrCreateCertificationCourse');
      requestResponseUtils.extractLocaleFromRequest.returns('fr');
      certificationCourseSerializer.serialize.returns('ok');
    });

    const retrievedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

    it('should call the use case with the right arguments', async function () {
      // given
      const usecaseArgs = { sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' };
      usecases.retrieveLastOrCreateCertificationCourse
        .withArgs(usecaseArgs)
        .resolves({ created: true, certificationCourse: retrievedCertificationCourse });
      sinon.stub(DomainTransaction, 'execute').callsFake(() => {
        return usecases.retrieveLastOrCreateCertificationCourse(usecaseArgs);
      });

      // when
      await certificationCourseController.save(request, hFake, {
        extractLocaleFromRequest: requestResponseUtils.extractLocaleFromRequest,
        certificationCourseSerializer,
      });

      // then
      sinon.assert.calledWith(usecases.retrieveLastOrCreateCertificationCourse, {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
      });
    });

    it('should reply the certification course serialized', async function () {
      // given
      const serializedCertificationCourse = Symbol('a serialized certification course');
      const usecaseArgs = { sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' };
      usecases.retrieveLastOrCreateCertificationCourse
        .withArgs(usecaseArgs)
        .resolves({ created: true, certificationCourse: retrievedCertificationCourse });
      sinon.stub(DomainTransaction, 'execute').callsFake(() => {
        return usecases.retrieveLastOrCreateCertificationCourse(usecaseArgs);
      });
      certificationCourseSerializer.serialize.resolves(serializedCertificationCourse);

      // when
      const response = await certificationCourseController.save(request, hFake, {
        extractLocaleFromRequest: requestResponseUtils.extractLocaleFromRequest,
        certificationCourseSerializer,
      });

      // then
      expect(response.source).to.equal(serializedCertificationCourse);
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#get', function () {
    it('should fetch and return the given course, serialized as JSONAPI', async function () {
      // given
      const sessionId = 5;
      const certificationCourseId = 'certification_course_id';
      const certificationCourse = new CertificationCourse({ id: certificationCourseId, sessionId });
      const userId = 42;
      sinon.stub(usecases, 'getCertificationCourse').withArgs({ certificationCourseId }).resolves(certificationCourse);
      certificationCourseSerializer.serialize.withArgs(certificationCourse).resolves(certificationCourse);
      const request = {
        params: { id: certificationCourseId },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        auth: { credentials: { userId } },
      };

      // when
      const response = await certificationCourseController.get(request, hFake, { certificationCourseSerializer });

      // then
      expect(response).to.deep.equal(certificationCourse);
    });
  });

  describe('#getCertifiedProfile', function () {
    it('should fetch the associated certified profile serialized as JSONAPI', async function () {
      // given
      const skill1 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill1',
        name: 'skill_1',
        hasBeenAskedInCertif: false,
        tubeId: 'recTube1',
        difficulty: 1,
      });
      const skill2 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill2',
        name: 'skill_2',
        hasBeenAskedInCertif: true,
        tubeId: 'recTube1',
        difficulty: 2,
      });
      const tube1 = domainBuilder.buildCertifiedTube({
        id: 'recTube1',
        name: 'tube_1',
        competenceId: 'recCompetence1',
      });
      const competence1 = domainBuilder.buildCertifiedCompetence({
        id: 'recCompetence1',
        name: 'competence_1',
        areaId: 'recArea1',
        origin: 'Pix',
      });
      const area1 = domainBuilder.buildCertifiedArea({
        id: 'recArea1',
        name: 'area_1',
        color: 'someColor',
      });
      const certifiedProfile = domainBuilder.buildCertifiedProfile({
        id: 123,
        userId: 456,
        certifiedSkills: [skill1, skill2],
        certifiedTubes: [tube1],
        certifiedCompetences: [competence1],
        certifiedAreas: [area1],
      });
      certifiedProfileRepository.get.withArgs(123).resolves(certifiedProfile);
      certifiedProfileSerializer.serialize.withArgs(certifiedProfile).resolves('ok');
      const request = {
        params: { id: 123 },
      };

      // when
      const response = await certificationCourseController.getCertifiedProfile(request, hFake, {
        certifiedProfileRepository,
        certifiedProfileSerializer,
      });

      // then
      expect(response).to.deep.equal('ok');
    });
  });
});
