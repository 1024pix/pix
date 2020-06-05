const os = require('os');
const { expect, sinon, HttpTestServer, databaseBuilder, knex } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/system');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const _ = require('lodash');
const { system } = require('../../../../lib/config');

describe('Integration | Application | System | system-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(heapProfile, 'write').resolves(`${__dirname}/dummy-heap.txt`);
    sinon.stub(heapdump, 'writeSnapshot').yields(null, `${__dirname}/dummy-heap.txt`);
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#generateAndDownloadHeapDump', () => {

    context('Success cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should redirect to same path if host does not match', async () => {
        // when
        const response = await httpTestServer.request('GET', '/api/system/heap-dump/not-my-hostname');

        // then
        expect(response.statusCode).to.equal(302);
        expect(response.headers.location).to.equal('/api/system/heap-dump/not-my-hostname');
      });

      it('should resolve a 200 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('GET', `/api/system/heap-dump/${os.hostname()}`);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal('dummy-heap\n');
        expect(response.headers['content-disposition']).to.equal('attachment; filename=dummy-heap.txt');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', () => {
          // when
          const promise = httpTestServer.request('GET', `/api/system/heap-dump/${os.hostname()}`);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });
    });
  });

  describe('#generateAndDownloadHeapProfile', () => {

    context('when user is PixMaster', () => {
      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      context('when sampling heap profiler is disabled', () => {
        beforeEach(() => {
          sinon.stub(system, 'samplingHeapProfilerEnabled').value(false);
        });

        it('should return a 404 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result).to.equal('Heap profile sampling is not enabled');
        });
      });

      context('when sampling heap profiler is enabled', () => {
        beforeEach(() => {
          sinon.stub(system, 'samplingHeapProfilerEnabled').value(true);
        });

        it('should redirect to same path if host does not match', async () => {
          // when
          const response = await httpTestServer.request('GET', '/api/system/heap-profile/not-my-hostname');

          // then
          expect(response.statusCode).to.equal(302);
          expect(response.headers.location).to.equal('/api/system/heap-profile/not-my-hostname');
        });

        it('should resolve a 200 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.equal('dummy-heap\n');
          expect(response.headers['content-disposition']).to.equal('attachment; filename=dummy-heap.txt');
        });
      });
    });

    context('when user is not PixMaster', () => {

      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should resolve a 403 HTTP response', () => {
        // when
        const promise = httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#copyProfile', () => {

    context('when user is PixMaster', () => {
      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      context('when data from payload is invalid', () => {

        it('should return a 422 HTTP response with some details about the error', async () => {
          // when
          const response = await httpTestServer.request('POST', '/api/system/profile-copy', { srcUserId: 'invalidAttribute' });

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors).to.not.have.length(0);
        });
      });

      context('when data from payload is valid', () => {
        context('when one of the database is not reachable', () => {
          const databaseUrl = 'invalid DB url';

          it('should return a 400 HTTP response with error message related to unreachable database', async () => {
            // when
            const response = await httpTestServer.request('POST', '/api/system/profile-copy',
              { srcUserId: 1, destUserId: 1, srcDatabaseUrl: databaseUrl, destDatabaseUrl: databaseUrl, destOrganizationId: 1, destCreatorId: 1, destCertificationCenterId: 1 }
            );

            // then
            expect(response.statusCode).to.equal(400);
            expect(response.result.errors[0].detail).to.include('n\'existe pas ou bien est impossible à contacter.');
          });
        });

        context('when databases are reachable', () => {
          const srcDatabaseUrl = process.env.TEST_DATABASE_URL;
          const destDatabaseUrl = process.env.TEST_DATABASE_URL;
          let srcUserId;
          let destUserId;
          let destOrganizationId;
          let destCreatorId;
          let destCertificationCenterId;
          let expectedAssessmentEvaluation, expectedAnswerEvaluation, expectedKnowledgeElementEvaluation,
            expectedCampaign, expectedCampaignParticipation, expectedAssessmentCampaign, expectedAnswerCampaign,
            expectedKnowledgeElementCampaign, expectedSession, expectedCertificationCourse, expectedAssessmentCertification,
            expectedAnswerCertification, expectedAssessmentResult, expectedCompetenceMark, expectedCertificationChallenge,
            expectedTargetProfile, expectedTargetProfileSkill;
          let data;

          beforeEach(() => {
            const dbf = databaseBuilder.factory;
            srcUserId = dbf.buildUser().id;
            destUserId = dbf.buildUser().id;

            // Competence evaluation
            expectedAssessmentEvaluation = dbf.buildAssessment({ userId: srcUserId, type: 'COMPETENCE_EVALUATION', certificationCourseId: null });
            expectedAnswerEvaluation = dbf.buildAnswer({ assessmentId: expectedAssessmentEvaluation.id });
            expectedKnowledgeElementEvaluation = dbf.buildKnowledgeElement({ answerId: expectedAnswerEvaluation.id, assessmentId: expectedAssessmentEvaluation.id, userId: srcUserId });

            // Smart placement
            destCreatorId = dbf.buildUser().id;
            destOrganizationId = dbf.buildOrganization().id;
            dbf.buildMembership({ userId: destCreatorId, organizationId: destOrganizationId });
            expectedTargetProfile = dbf.buildTargetProfile({ organizationId: null });
            expectedTargetProfileSkill = dbf.buildTargetProfileSkill({ targetProfileId: expectedTargetProfile.id });
            expectedCampaign = dbf.buildCampaign({ organization: destOrganizationId, targetProfileId: expectedTargetProfile.id, archivedAt: null });
            expectedCampaignParticipation = dbf.buildCampaignParticipation({ campaignId: expectedCampaign.id, userId: srcUserId });
            expectedAssessmentCampaign = dbf.buildAssessment({ userId: srcUserId, type: 'SMART_PLACEMENT', campaignParticipationId: expectedCampaignParticipation.id, certificationCourseId: null });
            expectedAnswerCampaign = dbf.buildAnswer({ assessmentId: expectedAssessmentCampaign.id });
            expectedKnowledgeElementCampaign = dbf.buildKnowledgeElement({ answerId: expectedAnswerCampaign.id, assessmentId: expectedAssessmentCampaign.id, userId: srcUserId });

            // Certification
            destCertificationCenterId = dbf.buildCertificationCenter().id;
            expectedSession = dbf.buildSession({ certificationCenterId: destCertificationCenterId });
            expectedCertificationCourse = dbf.buildCertificationCourse({ sessionId: expectedSession.id, userId: srcUserId });
            expectedAssessmentCertification = dbf.buildAssessment({ userId: srcUserId, type: 'CERTIFICATION', certificationCourseId: expectedCertificationCourse.id });
            expectedAnswerCertification = dbf.buildAnswer({ assessmentId: expectedAssessmentCertification.id });
            expectedAssessmentResult = dbf.buildAssessmentResult({ assessmentId: expectedAssessmentCertification.id });
            expectedCompetenceMark = dbf.buildCompetenceMark({ assessmentResultId: expectedAssessmentResult.id });
            expectedCertificationChallenge = dbf.buildCertificationChallenge({ courseId: expectedCertificationCourse.id });

            data = { srcUserId, destUserId, destOrganizationId, destCreatorId, destCertificationCenterId, destDatabaseUrl, srcDatabaseUrl };
            return databaseBuilder.commit();
          });

          afterEach(async () => {
            await knex('knowledge-elements').delete();
            await knex('answers').delete();
            await knex('competence-marks').delete();
            await knex('assessment-results').delete();
            await knex('certification-challenges').delete();
            await knex('assessments').delete();
            await knex('campaign-participations').delete();
            await knex('certification-courses').delete();
            await knex('sessions').delete();
            await knex('campaigns').delete();
            await knex('target-profiles_skills').delete();
            return knex('target-profiles').delete();
          });

          it('should return a 204 HTTP response', async () => {
            // when
            const response = await httpTestServer.request('POST', '/api/system/profile-copy', data);

            // then
            expect(response.statusCode).to.equal(204);
          });

          it('should copy data from srcUser to destUser', async () => {
            // when
            await httpTestServer.request('POST', '/api/system/profile-copy', data);

            // then
            // Competence evaluation
            const actualAssessmentEvaluation = (await knex('assessments').where({ userId: destUserId, type: 'COMPETENCE_EVALUATION' }))[0];
            const actualAnswerEvaluation = (await knex('answers').where({ assessmentId: actualAssessmentEvaluation.id }))[0];
            const actualKnowledgeElementEvaluation = (await knex('knowledge-elements').where({ answerId: actualAnswerEvaluation.id }))[0];
            expect(_.omit(actualAssessmentEvaluation, ['id', 'userId'])).to.deep.equal(_.omit(expectedAssessmentEvaluation, ['id', 'userId']));
            expect(_.omit(actualAnswerEvaluation, ['id', 'assessmentId'])).to.deep.equal(_.omit(expectedAnswerEvaluation, ['id', 'assessmentId']));
            expect(_.omit(actualKnowledgeElementEvaluation, ['id', 'userId', 'answerId', 'assessmentId'])).to.deep.equal(_.omit(expectedKnowledgeElementEvaluation, ['id', 'userId', 'answerId', 'assessmentId']));

            // Smart placement
            const actualCampaignParticipation = (await knex('campaign-participations').where({ userId: destUserId }))[0];
            const actualCampaign = (await knex('campaigns').where({ id: actualCampaignParticipation.campaignId }))[0];
            const actualTargetProfile = (await knex('target-profiles').where({ id: actualCampaign.targetProfileId }))[0];
            const actualTargetProfileSkill = (await knex('target-profiles_skills').where({ targetProfileId: actualTargetProfile.id }))[0];
            const actualAssessmentCampaign = (await knex('assessments').where({ campaignParticipationId: actualCampaignParticipation.id }))[0];
            const actualAnswerCampaign = (await knex('answers').where({ assessmentId: actualAssessmentCampaign.id }))[0];
            const actualKnowledgeElementCampaign = (await knex('knowledge-elements').where({ answerId: actualAnswerCampaign.id }))[0];
            expect(_.omit(actualAssessmentCampaign, ['id', 'userId', 'campaignParticipationId'])).to.deep.equal(_.omit(expectedAssessmentCampaign, ['id', 'userId', 'campaignParticipationId']));
            expect(_.omit(actualAnswerCampaign, ['id', 'assessmentId'])).to.deep.equal(_.omit(expectedAnswerCampaign, ['id', 'assessmentId']));
            expect(_.omit(actualKnowledgeElementCampaign, ['id', 'userId', 'answerId', 'assessmentId'])).to.deep.equal(_.omit(expectedKnowledgeElementCampaign, ['id', 'userId', 'answerId', 'assessmentId']));
            expect(_.omit(actualTargetProfileSkill, ['id', 'targetProfileId'])).to.deep.equal(_.omit(expectedTargetProfileSkill, ['id', 'targetProfileId']));
            expect(_.omit(actualTargetProfile, ['id'])).to.deep.equal(_.omit(expectedTargetProfile, ['id']));
            expect(_.omit(actualCampaign, ['id', 'organizationId', 'creatorId', 'targetProfileId'])).to.deep.equal(_.omit(expectedCampaign, ['id', 'organizationId', 'creatorId', 'targetProfileId']));
            expect(_.omit(actualCampaignParticipation, ['id', 'campaignId', 'userId'])).to.deep.equal(_.omit(expectedCampaignParticipation, ['id', 'campaignId', 'userId']));

            // Certification
            const actualCertificationCourse = (await knex('certification-courses').where({ userId: destUserId }))[0];
            const actualSession = (await knex('sessions').where({ id: actualCertificationCourse.sessionId }))[0];
            const actualCertificationChallenge = (await knex('certification-challenges').where({ courseId: actualCertificationCourse.id }))[0];
            const actualAssessmentCertification = (await knex('assessments').where({ certificationCourseId: actualCertificationCourse.id }))[0];
            const actualAnswerCertification = (await knex('answers').where({ assessmentId: actualAssessmentCertification.id }))[0];
            const actualAssessmentResult = (await knex('assessment-results').where({ assessmentId: actualAssessmentCertification.id }))[0];
            const actualCompetenceMark = (await knex('competence-marks').where({ assessmentResultId: actualAssessmentResult.id }))[0];
            expect(_.omit(actualCertificationCourse, ['id', 'userId', 'sessionId', 'lastName', 'firstName', 'birthdate', 'birthplace', 'externalId']))
              .to.deep.equal(_.omit(expectedCertificationCourse, ['id', 'userId', 'sessionId', 'lastName', 'firstName', 'birthdate', 'birthplace', 'externalId']));
            expect(_.omit(actualSession, ['id', 'certificationCenterId', 'assignedCertificationOfficerId'])).to.deep.equal(_.omit(expectedSession, ['id', 'certificationCenterId', 'assignedCertificationOfficerId']));
            expect(_.omit(actualCertificationChallenge, ['id', 'courseId'])).to.deep.equal(_.omit(expectedCertificationChallenge, ['id', 'courseId']));
            expect(_.omit(actualAssessmentCertification, ['id', 'userId', 'certificationCourseId'])).to.deep.equal(_.omit(actualAssessmentCertification, ['id', 'userId', 'certificationCourseId']));
            expect(_.omit(actualAnswerCertification, ['id', 'assessmentId'])).to.deep.equal(_.omit(expectedAnswerCertification, ['id', 'assessmentId']));
            expect(_.omit(actualAssessmentResult, ['id', 'assessmentId', 'juryId'])).to.deep.equal(_.omit(expectedAssessmentResult, ['id', 'assessmentId', 'juryId']));
            expect(_.omit(actualCompetenceMark, ['id', 'assessmentResultId'])).to.deep.equal(_.omit(expectedCompetenceMark, ['id', 'assessmentResultId']));
          });
        });
      });
    });

    context('when user is not PixMaster', () => {

      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should resolve a 403 HTTP response', () => {
        // when
        const promise = httpTestServer.request('POST', '/api/system/profile-copy');

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
