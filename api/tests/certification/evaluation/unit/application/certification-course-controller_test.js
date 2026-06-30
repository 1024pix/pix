import sinon from 'sinon';

import { certificationCourseController } from '../../../../../src/certification/evaluation/application/certification-course-controller.js';
import { usecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { CertificationCourse } from '../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Controller | certification-course-controller', function () {
  let certificationCourseSerializer;

  beforeEach(function () {
    certificationCourseSerializer = {
      serialize: sinon.stub(),
      serializeFromCertificationCourse: sinon.stub(),
      deserializeCertificationCandidateModificationCommand: sinon.stub(),
    };
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
              locale: 'fr-fr',
            },
          },
        },
        headers: {
          'x-timezone': 'Europe/Amsterdam',
        },
      };
      sinon.stub(usecases, 'retrieveLastOrCreateCertificationCourse');
      certificationCourseSerializer.serialize.returns('ok');
    });

    const retrievedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

    it('should call the use case with the right arguments', async function () {
      // given
      const usecaseArgs = {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
        locale: 'fr-fr',
        clientTimezone: 'Europe/Amsterdam',
      };
      usecases.retrieveLastOrCreateCertificationCourse
        .withArgs(usecaseArgs)
        .resolves({ created: true, certificationCourse: retrievedCertificationCourse });

      // when
      await certificationCourseController.save(request, hFake, { certificationCourseSerializer });

      // then
      expect(usecases.retrieveLastOrCreateCertificationCourse).to.have.been.calledOnce;
    });

    it('should reply the certification course serialized', async function () {
      // given
      const serializedCertificationCourse = Symbol('a serialized certification course');
      const usecaseArgs = {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
        locale: 'fr-fr',
        clientTimezone: 'Europe/Amsterdam',
      };
      usecases.retrieveLastOrCreateCertificationCourse
        .withArgs(usecaseArgs)
        .resolves({ created: true, certificationCourse: retrievedCertificationCourse });
      certificationCourseSerializer.serialize.resolves(serializedCertificationCourse);

      // when
      const response = await certificationCourseController.save(request, hFake, { certificationCourseSerializer });

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
        params: { certificationCourseId },
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        auth: { credentials: { userId } },
      };

      // when
      const response = await certificationCourseController.get(request, hFake, { certificationCourseSerializer });

      // then
      expect(response).to.deep.equal(certificationCourse);
    });
  });
});
