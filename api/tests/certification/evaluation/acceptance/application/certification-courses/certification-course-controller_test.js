import { createServer } from '../../../../../../server.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import {
  generateAuthenticatedUserRequestHeaders,
  generateInjectOptions,
} from '../../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Certification Course', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-courses/{id}', function () {
    let options;
    let userId;
    let otherUserId;
    let expectedJson;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      domainBuilder.certification.evaluation
        .certificationCourseInfoBuilder()
        .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
        .asAdjustedForAccessibility()
        .withNbChallenges(45)
        .withParameters({ id: 123, assessmentId: 456 })
        .insertToDB({ databaseBuilder, existingUserId: userId });
      otherUserId = databaseBuilder.factory.buildUser().id;

      options = {
        method: 'GET',
        url: `/api/certification-courses/123`,
        headers: {},
      };

      expectedJson = {
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
      };
      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 403 - forbidden access - if user is not linked to the certification course', async function () {
        // given
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    it('should return the certification course', async function () {
      // given
      options.headers = generateAuthenticatedUserRequestHeaders({ userId });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.deep.equal(expectedJson);
    });
  });

  describe('POST /api/certification-courses', function () {
    let response;

    context('when the certification course does not exist', function () {
      context('when locale is fr-fr', function () {
        it('should respond with 201 status code, create a v3 certification', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          const { certificationCandidate } = _createNonExistingCertifCourseSetup({
            userId,
            sessionId,
          });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourse.version).to.equal(AlgorithmEngineVersion.V3);
          expect(certificationCourse.lang).to.equal('fr-fr');
          expect(certificationCourse.firstName).to.equal(certificationCandidate.firstName);
          expect(certificationCourse.lastName).to.equal(certificationCandidate.lastName);
          expect(certificationCourse.birthdate).to.equal(certificationCandidate.birthdate);
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    context('when the certification course already exists', function () {
      it('should respond with 200 status code and retrieve the already existing certification course', async function () {
        // given
        const { options, userId, sessionId } = _createRequestOptions({ version: AlgorithmEngineVersion.V3 });
        _createExistingCertifCourseSetup({ userId, sessionId, version: AlgorithmEngineVersion.V3 });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
        expect(certificationCourse.version).to.equal(AlgorithmEngineVersion.V3);
      });
    });
  });
});

function _createRequestOptions(
  { locale = 'fr-fr', version = AlgorithmEngineVersion.V2 } = { locale: 'fr-fr', version: AlgorithmEngineVersion.V2 },
) {
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({ accessCode: '123', certificationCenterId, version }).id;
  const payload = {
    data: {
      attributes: {
        'access-code': '123',
        'session-id': sessionId,
      },
    },
  };
  const options = generateInjectOptions({
    method: 'POST',
    url: '/api/certification-courses',
    payload,
    locale,
    audience: 'https://app.pix.fr',
    authorizationData: { userId },
  });

  return {
    options,
    userId,
    sessionId,
  };
}

function _createNonExistingCertifCourseSetup({ sessionId, userId }) {
  const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    authorizedToStartAt: new Date(),
    reconciledAt: new Date('2019-02-01'),
  });

  domainBuilder.certification.configuration
    .versionBuilder()
    .asDraft({ startDate: new Date('2019-01-01') })
    .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 123 })
    .insertToDB({ databaseBuilder });

  return { certificationCandidate };
}

function _createExistingCertifCourseSetup({ userId, sessionId, version = 2, createdAt = new Date() }) {
  const certifVersion = domainBuilder.certification.configuration
    .versionBuilder()
    .asDraft({ startDate: new Date('2020-01-01') })
    .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
    .insertToDB({ databaseBuilder });
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    authorizedToStartAt: new Date(),
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    candidateId,
    userId,
    sessionId,
    version,
    createdAt,
    versionId: certifVersion.id,
  }).id;
  databaseBuilder.factory.buildAssessment({ userId, certificationCourseId });
}
