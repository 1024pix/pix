import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
  insertUserWithRoleSuperAdmin,
  nock,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { generateCertificateVerificationCode } from '../../../../../lib/domain/services/verify-certificate-code-service.js';
import { AssessmentResult, Membership } from '../../../../../lib/domain/models/index.js';
import { readFile } from 'node:fs/promises';
import * as url from 'url';

describe('Acceptance | Route | certification-attestation', function () {
  beforeEach(async function () {
    const learningContent = [
      {
        id: 'recvoGdo7z2z7pXWa',
        code: '1',
        name: '1. Information et données',
        title_i18n: { fr: 'Information et données' },
        color: 'jaffa',
        competences: [
          {
            id: 'recsvLz0W2ShyfD63',
            name_i18n: { fr: 'Mener une recherche et une veille d’information' },
            index: '1.1',
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  {
                    id: 'recSkillId1',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recNv8qhaY887jQb2',
            name_i18n: { fr: 'Gérer des données' },
            index: '1.2',
            tubes: [
              {
                id: 'recTube2',
                skills: [
                  {
                    id: 'recSkillId2',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recIkYm646lrGvLNT',
            name_i18n: { fr: 'Traiter des données' },
            index: '1.3',
            tubes: [
              {
                id: 'recTube3',
                skills: [
                  {
                    id: 'recSkillId3',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);

    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    nock('http://tarte.fr')
      .get('/sticker.pdf')
      .reply(200, () => readFile(`${__dirname}/sticker.pdf`));
  });

  describe('GET /api/attestation/', function () {
    context('when user own the certification', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await _buildDatabaseForV2Certification({ userId, certificationCourseId: 1234 });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attestation/1234?isFrenchDomainExtension=true&lang=fr',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.include('filename=attestation-pix');
        expect(response.file).not.to.be.null;
      });
    });
  });

  describe('GET /api/admin/sessions/{id}/attestations', function () {
    it('should return 200 HTTP status code and the certification', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      await _buildDatabaseForV2Certification({ userId: superAdmin.id, sessionId: 4567 });
      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/sessions/4567/attestations',
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('application/pdf');
      expect(response.headers['content-disposition']).to.include('filename=attestation-pix');
      expect(response.file).not.to.be.null;
    });
  });

  describe('GET /api/organizations/{id}/certification-attestations', function () {
    it('should return HTTP status 200', async function () {
      // given
      const adminIsManagingStudent = databaseBuilder.factory.buildUser.withRawPassword();

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: adminIsManagingStudent.id,
        organizationRole: Membership.roles.ADMIN,
      });

      const student = databaseBuilder.factory.buildUser.withRawPassword();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 'aDivision',
        userId: student.id,
      });

      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        organizationLearnerId: organizationLearner.id,
        userId: student.id,
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId: candidate.userId,
        sessionId: candidate.sessionId,
        isPublished: true,
        isCancelled: false,
      });

      const badge = databaseBuilder.factory.buildBadge({ key: 'a badge' });

      const assessment = databaseBuilder.factory.buildAssessment({
        userId: candidate.userId,
        certificationCourseId: certificationCourse.id,
        type: Assessment.types.CERTIFICATION,
        state: 'completed',
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: certificationCourse.id,
        assessmentId: assessment.id,
        status: AssessmentResult.status.VALIDATED,
      });
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.3',
        assessmentResultId: assessmentResult.id,
        acquiredComplementaryCertifications: [badge.key],
      });

      await databaseBuilder.commit();

      const server = await createServer();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/certification-attestations?division=aDivision&isFrenchDomainExtension=true&lang=fr`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminIsManagingStudent.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

async function _buildDatabaseForV2Certification({ userId, certificationCourseId = 10, sessionId = 12 }) {
  const session = databaseBuilder.factory.buildSession({
    id: sessionId,
    publishedAt: new Date('2018-12-01T01:02:03Z'),
  });
  const badge = databaseBuilder.factory.buildBadge({ key: 'charlotte_aux_fraises' });
  const cc = databaseBuilder.factory.buildComplementaryCertification();
  const ccBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
    complementaryCertificationId: cc.id,
    badgeId: badge.id,
    imageUrl: 'http://tarte.fr/mirabelle.png',
    isTemporaryBadge: false,
    label: 'tarte à la mirabelle',
    certificateMessage: 'Miam',
    stickerUrl: 'http://tarte.fr/sticker.pdf',
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    id: certificationCourseId,
    userId,
    isPublished: true,
    maxReachableLevelOnCertificationDate: 3,
    verificationCode: await generateCertificateVerificationCode(),
  });
  const assessment = databaseBuilder.factory.buildAssessment({
    userId,
    certificationCourseId: certificationCourse.id,
    type: Assessment.types.CERTIFICATION,
    state: 'completed',
  });
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationCourse.id,
    assessmentId: assessment.id,
    level: 1,
    pixScore: 23,
    emitter: 'PIX-ALGO',
    status: 'validated',
  });
  const { id } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: certificationCourse.id,
    complementaryCertificationBadgeId: ccBadge.id,
    name: 'patisseries au fruits',
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: id,
    complementaryCertificationBadgeId: ccBadge.id,
  });
  return { userId, session, badge, certificationCourse, assessment, assessmentResult };
}
