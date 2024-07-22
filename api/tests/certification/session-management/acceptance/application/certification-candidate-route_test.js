import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | Session | certification-candidate-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
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
});
