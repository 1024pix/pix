const { sinon, expect, hFake, generateValidRequestAuthorizationHeader, domainBuilder } = require('../../../test-helper');
const certificationCourseController = require('../../../../lib/application/certification-courses/certification-course-controller');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseService = require('../../../../lib/domain/services/certification-course-service');
const certificationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const certificationResultInformationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-result-information-serializer');
const usecases = require('../../../../lib/domain/usecases');
const certifiedProfileRepository = require('../../../../lib/infrastructure/repositories/certified-profile-repository');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Controller | certification-course-controller', () => {

  describe('#computeResult', () => {

    const certificationCourseId = 1245;
    const certificationScore = 156;

    const request = {
      params: {
        id: certificationCourseId,
      },
      route: {
        path: '/certification',
      },
    };

    beforeEach(() => {
      sinon.stub(certificationService, 'calculateCertificationResultByCertificationCourseId').resolves(certificationScore);
    });

    it('should call certification Service to compute score', async () => {
      // when
      await certificationCourseController.computeResult(request, hFake);

      // then
      sinon.assert.calledOnce(certificationService.calculateCertificationResultByCertificationCourseId);
      sinon.assert.calledWith(certificationService.calculateCertificationResultByCertificationCourseId, certificationCourseId);
    });

    it('should reply the score', async () => {
      // when
      const response = await certificationCourseController.computeResult(request, hFake);

      // then
      expect(response).to.equal(certificationScore);
    });
  });

  describe('#getCertificationDetails', () => {

    it('should return a serialized certification details', async () => {
      // given
      sinon.stub(usecases, 'getCertificationDetails');
      const certificationCourseId = 1234;
      const request = {
        params: {
          id: certificationCourseId,
        },
      };

      usecases.getCertificationDetails
        .withArgs({ certificationCourseId })
        .resolves(domainBuilder.buildCertificationDetails({
          competencesWithMark: [
            {
              areaCode: '1',
              id: 'recComp1',
              index: '1.1',
              name: 'Manger des fruits',
              obtainedLevel: 1,
              obtainedScore: 5,
              positionedLevel: 3,
              positionedScore: 45,
            },
          ],
          createdAt: '12-02-2000',
          completedAt: '15-02-2000',
          id: 456,
          listChallengesAndAnswers: [
            {
              challengeId: 'rec123',
              competence: '1.1',
              result: 'ok',
              skill: 'manger une mangue',
              value: 'prout',
            },
          ],
          percentageCorrectAnswers: 100,
          status: 'started',
          totalScore: 5,
          userId: 123,
        }));

      // when
      const result = await certificationCourseController.getCertificationDetails(request);

      // then
      expect(result.data).to.deep.equal({
        'id': '456',
        'type': 'certification-details',
        'attributes': {
          'user-id': 123,
          'created-at': '12-02-2000',
          'completed-at': '15-02-2000',
          'status': 'started',
          'total-score': 5,
          'percentage-correct-answers': 100,
          'competences-with-mark': [
            {
              areaCode: '1',
              'id': 'recComp1',
              'index': '1.1',
              'name': 'Manger des fruits',
              obtainedLevel: 1,
              obtainedScore: 5,
              positionedLevel: 3,
              positionedScore: 45,
            },
          ],
          'list-challenges-and-answers': [
            {
              challengeId: 'rec123',
              'competence': '1.1',
              'result': 'ok',
              'skill': 'manger une mangue',
              'value': 'prout',
            },
          ],
        },
      });
    });
  });

  describe('#getCertificationResultInformation', () => {

    it('should return certification result', async () => {
      // given
      const certificationCourseId = 1;
      const request = {
        params: {
          id: certificationCourseId,
        },
      };

      const certificationResultInformation = Symbol('aCertifResultInfo');
      sinon.stub(usecases, 'getCertificationResultInformation')
        .withArgs({ certificationCourseId }).resolves(certificationResultInformation);

      const certificationResultInformationSerialized = Symbol('a full certification results');
      sinon.stub(certificationResultInformationSerializer, 'serialize')
        .withArgs(certificationResultInformation)
        .resolves(certificationResultInformationSerialized);

      // when
      const result = await certificationCourseController.getCertificationResultInformation(request, hFake);

      // then
      expect(result).to.deep.equal(certificationResultInformationSerialized);
    });
  });

  describe('#update', () => {

    const updatedCertificationCourse = new CertificationCourse();

    const JsonAPISavedCertification = {
      data: {
        type: Assessment.types.CERTIFICATION,
        attributes: {
          id: '1',
          firstName: 'Phil',
          status: 'rejected',
        },
      },
    };

    beforeEach(() => {
      sinon.stub(certificationSerializer, 'deserialize').resolves();
      sinon.stub(certificationSerializer, 'serializeFromCertificationCourse').returns(JsonAPISavedCertification);
    });

    const options = {
      method: 'PATCH', url: '/api/certification-courses/1245', payload: {
        data: {
          type: 'certifications',
          attributes: {
            id: '1',
            firstName: 'Phil',
            status: 'rejected',
          },
        },
      },
    };

    it('should deserialize the request payload', async () => {
      // given
      sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      await certificationCourseController.update(options, hFake);

      // then
      sinon.assert.calledOnce(certificationSerializer.deserialize);
    });

    it('should patch certificationCourse data using save method', async () => {
      // given
      sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);

      // when
      await certificationCourseController.update(options, hFake);

      // then
      sinon.assert.calledOnce(certificationCourseService.update);
    });

    context('when certification course was modified', () => {

      beforeEach(() => {
        sinon.stub(certificationCourseService, 'update').resolves(updatedCertificationCourse);
      });

      it('should serialize saved certification course', async () => {
        // when
        await certificationCourseController.update(options, hFake);

        // then
        sinon.assert.calledOnce(certificationSerializer.serializeFromCertificationCourse);
        sinon.assert.calledWith(certificationSerializer.serializeFromCertificationCourse, updatedCertificationCourse);
      });

      it('should reply serialized certification course', async () => {
        // when
        const response = await certificationCourseController.update(options, hFake);

        // then
        expect(response).to.deep.equal(JsonAPISavedCertification);
      });
    });
  });

  describe('#save', () => {

    let request;

    beforeEach(() => {
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
      sinon.stub(certificationCourseSerializer, 'serialize');
    });

    const retrievedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

    it('should call the use case with the right arguments', async () => {
      // given
      const usecaseArgs = { sessionId: '12345', accessCode: 'ABCD12', userId: 'userId' };
      usecases.retrieveLastOrCreateCertificationCourse
        .withArgs(usecaseArgs)
        .resolves({ created: true, certificationCourse: retrievedCertificationCourse });
      sinon.stub(DomainTransaction, 'execute').callsFake(() => {
        return usecases.retrieveLastOrCreateCertificationCourse(usecaseArgs);
      });

      // when
      await certificationCourseController.save(request, hFake);

      // then
      sinon.assert.calledWith(usecases.retrieveLastOrCreateCertificationCourse, {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
      });
    });

    it('should reply the certification course serialized', async () => {
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
      const response = await certificationCourseController.save(request, hFake);

      // then
      expect(response.source).to.equal(serializedCertificationCourse);
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#get', () => {

    let certificationCourse;
    const certificationCourseId = 'certification_course_id';

    beforeEach(() => {
      certificationCourse = new CertificationCourse({ 'id': certificationCourseId });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async () => {
      // given
      const userId = 42;
      sinon.stub(usecases, 'getCertificationCourse')
        .withArgs({ userId, certificationCourseId })
        .resolves(certificationCourse);
      sinon.stub(certificationCourseSerializer, 'serialize')
        .withArgs(certificationCourse)
        .resolves(certificationCourse);
      const request = {
        params: { id: certificationCourseId },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        auth: { credentials: { userId } },
      };

      // when
      const response = await certificationCourseController.get(request, hFake);

      // then
      expect(response).to.deep.equal(certificationCourse);
    });
  });

  describe('#getCertifiedProfile', () => {

    it('should fetch the associated certified profile serialized as JSONAPI', async () => {
      // given
      const skill1 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill1',
        name: 'skill_1',
        hasBeenAskedInCertif: false,
        tubeId: 'recTube1',
      });
      const skill2 = domainBuilder.buildCertifiedSkill({
        id: 'recSkill2',
        name: 'skill_2',
        hasBeenAskedInCertif: true,
        tubeId: 'recTube1',
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
      sinon.stub(certifiedProfileRepository, 'get')
        .withArgs(123)
        .resolves(certifiedProfile);
      const request = {
        params: { id: 123 },
      };

      // when
      const response = await certificationCourseController.getCertifiedProfile(request);

      // then
      expect(response).to.deep.equal({
        data: {
          id: '123',
          type: 'certified-profiles',
          attributes: {
            'user-id': 456,
          },
          relationships: {
            'certified-skills': {
              data: [
                {
                  id: 'recSkill1',
                  type: 'certified-skills',
                },
                {
                  id: 'recSkill2',
                  type: 'certified-skills',
                },
              ],
            },
            'certified-tubes': {
              data: [
                {
                  id: 'recTube1',
                  type: 'certified-tubes',
                },
              ],
            },
            'certified-competences': {
              data: [
                {
                  id: 'recCompetence1',
                  type: 'certified-competences',
                },
              ],
            },
            'certified-areas': {
              data: [
                {
                  id: 'recArea1',
                  type: 'certified-areas',
                },
              ],
            },
          },
        },
        included: [
          {
            id: 'recSkill1',
            type: 'certified-skills',
            attributes: {
              name: 'skill_1',
              'has-been-asked-in-certif': false,
              'tube-id': 'recTube1',
              'difficulty': 1,
            },
          },
          {
            id: 'recSkill2',
            type: 'certified-skills',
            attributes: {
              name: 'skill_2',
              'has-been-asked-in-certif': true,
              'tube-id': 'recTube1',
              'difficulty': 2,
            },
          },
          {
            id: 'recTube1',
            type: 'certified-tubes',
            attributes: {
              'name': 'tube_1',
              'competence-id': 'recCompetence1',
            },
          },
          {
            id: 'recCompetence1',
            type: 'certified-competences',
            attributes: {
              'name': 'competence_1',
              'area-id': 'recArea1',
            },
          },
          {
            id: 'recArea1',
            type: 'certified-areas',
            attributes: {
              'name': 'area_1',
              'color': 'someColor',
            },
          },
        ],
      });
    });
  });
});
