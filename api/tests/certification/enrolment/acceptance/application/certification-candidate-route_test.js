import { CertificationCandidate } from '../../../../../lib/domain/models/index.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';
const { ROLES } = PIX_ADMIN;

describe('Acceptance | Controller | Session | certification-candidate-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/sessions/{id}/certification-candidates', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterUserId = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.CERTIF,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: certificationCenterUserId,
        certificationCenterId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser({}).id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        billingMode: CertificationCandidate.BILLING_MODES.PREPAID,
      }).id;
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateId });
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 10000006,
        key: ComplementaryCertificationKeys.CLEA,
        label: 'CléA Numérique',
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidateId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(certificationCenterUserId, 'pix-certif') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        '{"data":[{"type":"certification-candidates","id":"1001","attributes":{"first-name":"first-name","last-name":"last-name","birthdate":"2000-01-04","birth-province-code":null,"birth-city":"PARIS 1","birth-country":"France","email":"somemail@example.net","result-recipient-email":"somerecipientmail@example.net","external-id":"externalId","extra-time-percentage":0.3,"is-linked":true,"organization-learner-id":null,"sex":"M","birth-insee-code":"75101","birth-postal-code":null,"complementary-certification":{"id":10000006,"label":"CléA Numérique","key":"CLEA"},"billing-mode":"PREPAID","prepayment-code":null}}]}',
      );
    });
  });

  describe('POST /api/certification-candidates/:id/authorize-to-start', function () {
    context('when user is authenticated', function () {
      context('when the user is the supervisor of the session', function () {
        it('should return a 204 status code', async function () {
          // given
          const candidateUserId = databaseBuilder.factory.buildUser({}).id;
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
          const sessionId = databaseBuilder.factory.buildSession({
            publishedAt: null,
            certificationCenterId: certificationCenter.id,
          }).id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId: candidateUserId,
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            id: 1001,
            sessionId,
            userId: candidateUserId,
          });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
          databaseBuilder.factory.buildAssessment({
            state: 'started',
            userId: candidateUserId,
            type: 'CERTIFICATION',
            certificationCourseId,
          });

          const supervisorUserId = databaseBuilder.factory.buildUser({}).id;
          databaseBuilder.factory.buildSupervisorAccess({
            userId: supervisorUserId,
            sessionId,
          });

          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/certification-candidates/${candidate.id}/authorize-to-start`,
            headers: { authorization: generateValidRequestAuthorizationHeader(supervisorUserId, 'pix-certif') },
            payload: { 'authorized-to-start': true },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('PATCH /api/certification-candidates/{certificationCandidateId}/validate-certification-instructions', function () {
    it('should respond with a 200', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const candidateUserId = databaseBuilder.factory.buildUser().id;
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        id: 1001,
        sessionId,
        userId: candidateUserId,
        hasSeenCertificationInstructions: false,
      }).id;

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'PATCH',
        url: `/api/certification-candidates/${candidateId}/validate-certification-instructions`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(candidateUserId, 'pix') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            birthdate: '2000-01-04',
            'first-name': 'first-name',
            'has-seen-certification-instructions': true,
            'last-name': 'last-name',
            'session-id': sessionId,
          },
          id: '1001',
          type: 'certification-candidates',
        },
      });
    });
  });
});
