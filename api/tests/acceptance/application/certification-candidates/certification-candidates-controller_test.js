const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const { features } = require('../../../../lib/config');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Acceptance | API | Certifications candidates', function () {
  describe('POST /api/certification-candidates/:id/authorize-to-start', function () {
    context('when user is authenticated', function () {
      describe('when FT_ALLOWED_CERTIFICATION_CENTER_IDS_FOR_END_TEST_SCREEN_REMOVAL is enabled for the certification center', function () {
        context('when the user is the supervisor of the session', function () {
          it('should return a 204 status code', async function () {
            // given
            const server = await createServer();
            const candidateUserId = databaseBuilder.factory.buildUser({}).id;
            const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
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
            sinon.stub(features, 'endTestScreenRemovalWhiteList').value([certificationCenter.id]);

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

  describe('POST /api/certification-candidates/:id/authorize-to-resume', function () {
    context('when user is authenticated', function () {
      describe('when FT_ALLOWED_CERTIFICATION_CENTER_IDS_FOR_END_TEST_SCREEN_REMOVAL is enabled for the certification center', function () {
        context('when the user is the supervisor of the session', function () {
          it('should return a 204 status code', async function () {
            // given
            const server = await createServer();
            const candidateUserId = databaseBuilder.factory.buildUser().id;
            const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
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
            sinon.stub(features, 'endTestScreenRemovalWhiteList').value([certificationCenter.id]);

            const options = {
              method: 'POST',
              url: `/api/certification-candidates/${candidate.id}/authorize-to-resume`,
              headers: { authorization: generateValidRequestAuthorizationHeader(supervisorUserId, 'pix-certif') },
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

  describe('PATCH /api/certification-candidates/{id}/end-assessment-by-supervisor', function () {
    context('when user is authenticated', function () {
      context(
        'when FT_ALLOWED_CERTIFICATION_CENTER_IDS_FOR_END_TEST_SCREEN_REMOVAL is enabled for the certification center',
        function () {
          context('when the user is the supervisor of the session', function () {
            it('should return a 204 status code', async function () {
              // given
              const server = await createServer();
              const candidateUserId = databaseBuilder.factory.buildUser({}).id;
              const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
              const sessionId = databaseBuilder.factory.buildSession({
                certificationCenterId: certificationCenter.id,
              }).id;
              const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
                sessionId,
                userId: candidateUserId,
              }).id;
              databaseBuilder.factory.buildCertificationCandidate({
                id: 1001,
                sessionId,
                userId: candidateUserId,
              });
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
              sinon.stub(features, 'endTestScreenRemovalWhiteList').value([certificationCenter.id]);

              await databaseBuilder.commit();
              const options = {
                method: 'PATCH',
                url: `/api/certification-candidates/1001/end-assessment-by-supervisor`,
                headers: { authorization: generateValidRequestAuthorizationHeader(supervisorUserId, 'pix-certif') },
              };

              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(204);
            });
          });
        }
      );
    });
  });

  describe('GET /api/certification-candidates/:id/subscriptions', function () {
    it('should return the certification candidate subscriptions', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const session = databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
      });
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
      });

      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/certification-candidates/${candidate.id}/subscriptions`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: `${candidate.id}`,
        type: 'certification-candidate-subscriptions',
        attributes: {
          'session-id': session.id,
          'eligible-subscriptions': [],
          'non-eligible-subscriptions': [
            {
              id: cleaComplementaryCertification.id,
              name: 'CléA Numérique',
            },
            {
              id: pixPlusDroitComplementaryCertification.id,
              name: 'Pix+ Droit',
            },
          ],
        },
      });
    });
  });
});
