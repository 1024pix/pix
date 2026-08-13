import { expect } from 'chai';
import sinon from 'sinon';

import { certificationCourseController } from '../../../../../src/certification/evaluation/application/certification-course-controller.js';
import { usecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import * as certificationCourseInfoSerializer from '../../../../../src/certification/evaluation/infrastructure/serializers/certification-course-info-serializer.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Unit | Controller | certification-course-controller', function () {
  let certificationCourseInfoRepository, request;

  describe('#save', function () {
    let startOrResumeStub;
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
      startOrResumeStub = sinon.stub(usecases, 'startOrResumeCertification');
    });

    it('should reply with response 201 when the certification started', async function () {
      // given
      const usecaseArgs = {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
        locale: 'fr-fr',
        clientTimezone: 'Europe/Amsterdam',
      };
      const certificationCourseInfo = domainBuilder.certification.evaluation
        .certificationCourseInfoBuilder()
        .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
        .asAdjustedForAccessibility()
        .withNbChallenges(45)
        .withParameters({ id: 123, assessmentId: 456 })
        .build();
      startOrResumeStub
        .withArgs(usecaseArgs)
        .resolves({ hasResumed: false, certificationCourseInfo: certificationCourseInfo });

      // when
      const response = await certificationCourseController.save(request, hFake, { certificationCourseInfoSerializer });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.source.data).to.deep.equal({
        type: 'certification-courses',
        id: '123',
        attributes: {
          'nb-challenges': 45,
          'first-name': 'Anneso',
          'last-name': 'Coucou',
          'is-adjusted-for-accessibility': true,
          version: 3,
        },
        relationships: {
          assessment: {
            links: {
              related: '/api/assessments/456',
            },
          },
        },
      });
    });

    it('should reply solely with the serialized certification when resumed', async function () {
      // given
      const usecaseArgs = {
        sessionId: '12345',
        accessCode: 'ABCD12',
        userId: 'userId',
        locale: 'fr-fr',
        clientTimezone: 'Europe/Amsterdam',
      };
      const certificationCourseInfo = domainBuilder.certification.evaluation
        .certificationCourseInfoBuilder()
        .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
        .asAdjustedForAccessibility()
        .withNbChallenges(45)
        .withParameters({ id: 123, assessmentId: 456 })
        .build();
      startOrResumeStub
        .withArgs(usecaseArgs)
        .resolves({ hasResumed: true, certificationCourseInfo: certificationCourseInfo });

      // when
      const response = await certificationCourseController.save(request, hFake, { certificationCourseInfoSerializer });

      // then
      expect(response.data).to.deep.equal({
        type: 'certification-courses',
        id: '123',
        attributes: {
          'nb-challenges': 45,
          'first-name': 'Anneso',
          'last-name': 'Coucou',
          'is-adjusted-for-accessibility': true,
          version: 3,
        },
        relationships: {
          assessment: {
            links: {
              related: '/api/assessments/456',
            },
          },
        },
      });
    });
  });

  describe('#get', function () {
    it('returns the serialized certification course info', async function () {
      // given
      const certificationCourseInfo = domainBuilder.certification.evaluation
        .certificationCourseInfoBuilder()
        .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
        .asAdjustedForAccessibility()
        .withNbChallenges(45)
        .withParameters({ id: 123, assessmentId: 456 })
        .build();
      certificationCourseInfoRepository = {
        find: sinon.fake.resolves(certificationCourseInfo),
      };
      const request = {
        params: { certificationCourseId: 123 },
      };

      // when
      const response = await certificationCourseController.get(request, hFake, {
        certificationCourseInfoRepository,
        certificationCourseInfoSerializer,
      });

      // then
      expect(response).to.deep.equal({
        data: {
          type: 'certification-courses',
          id: '123',
          attributes: {
            'nb-challenges': 45,
            'first-name': 'Anneso',
            'last-name': 'Coucou',
            'is-adjusted-for-accessibility': true,
            version: 3,
          },
          relationships: {
            assessment: {
              links: {
                related: '/api/assessments/456',
              },
            },
          },
        },
      });
    });

    it('throws a 404 not found when no certification info found for id', async function () {
      // given
      certificationCourseInfoRepository = {
        find: sinon.fake.resolves(null),
      };
      const request = {
        params: { certificationCourseId: 123 },
      };

      // when
      const err = await catchErr(certificationCourseController.get)(request, hFake, {
        certificationCourseInfoRepository,
        certificationCourseInfoSerializer,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
    });
  });
});
