import { ComplementaryCertificationCourseResult } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | Application | jury-certification-route', function () {
  describe('GET /api/admin/certifications/{id}', function () {
    it('should return 200 HTTP status code along with serialized certification', async function () {
      // given
      const server = await createServer();
      databaseBuilder.factory.buildUser({ id: 789 });
      databaseBuilder.factory.buildSession({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({
        id: 123,
        sessionId: 456,
        userId: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthplace: 'Torreilles',
        birthdate: '2000-08-30',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'France',
        sex: 'F',
        isPublished: true,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
      });

      const pixBoxeComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Boxe',
        hasExternalJury: true,
      }).id;
      databaseBuilder.factory.buildTargetProfile({ id: 1212 });
      databaseBuilder.factory.buildBadge({
        id: 456,
        key: 'PIX_BOXE_1',
        targetProfileId: 1212,
      });
      databaseBuilder.factory.buildBadge({
        id: 457,
        key: 'PIX_BOXE_2',
        targetProfileId: 1212,
      });
      databaseBuilder.factory.buildBadge({
        id: 458,
        key: 'PIX_BOXE_3',
        targetProfileId: 1212,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 777,
        badgeId: 456,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 1',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 778,
        badgeId: 457,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 2',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 779,
        badgeId: 458,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 3',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 654,
        certificationCourseId: 123,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        complementaryCertificationBadgeId: 778,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 987,
        acquired: true,
        complementaryCertificationCourseId: 654,
        complementaryCertificationBadgeId: 778,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 986,
        acquired: false,
        complementaryCertificationCourseId: 654,
        complementaryCertificationBadgeId: 778,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 123 });
      databaseBuilder.factory.buildUser({ id: 66 });
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: 123,
        id: 456,
        assessmentId: 159,
        pixScore: 55,
        juryId: 66,
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        commentByJury: 'comment jury',
        status: 'rejected',
      });
      databaseBuilder.factory.buildCompetenceMark({
        id: 125,
        score: 10,
        level: 4,
        competence_code: '2.4',
        area_code: '3',
        competenceId: 'recComp25',
        assessmentResultId: 456,
      });
      const user = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/123',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'certifications',
        id: '123',
        attributes: {
          'session-id': 456,
          'user-id': 789,
          'assessment-id': 159,
          'first-name': 'Buffy',
          'last-name': 'Summers',
          birthdate: '2000-08-30',
          birthplace: 'Torreilles',
          sex: 'F',
          'birth-insee-code': '66212',
          'birth-postal-code': null,
          'birth-country': 'France',
          status: 'rejected',
          'is-cancelled': false,
          'is-published': true,
          'is-rejected-for-fraud': false,
          'created-at': new Date('2020-01-01'),
          'completed-at': new Date('2020-02-01'),
          'pix-score': 55,
          'jury-id': 66,
          'comment-for-candidate':
            "Les conditions de passation du test de certification n'ayant pas été respectées et ayant fait l'objet d'un signalement pour fraude, votre certification a été invalidée en conséquence.",
          'comment-by-jury': 'comment jury',
          'comment-for-organization':
            'Une situation de fraude a été détectée : après analyse, nous avons statué sur un rejet de la certification.',
          version: 2,
          'competences-with-mark': [
            {
              area_code: '3',
              assessmentResultId: 456,
              competenceId: 'recComp25',
              competence_code: '2.4',
              id: 125,
              level: 4,
              score: 10,
            },
          ],
        },
        relationships: {
          'certification-issue-reports': {
            data: [],
          },
          'common-complementary-certification-course-result': {
            data: null,
          },
          'complementary-certification-course-result-with-external': {
            data: {
              id: '654',
              type: 'complementaryCertificationCourseResultWithExternals',
            },
          },
        },
      });
      expect(response.result.included).to.deep.equal([
        {
          id: '654',
          type: 'complementaryCertificationCourseResultWithExternals',
          attributes: {
            'allowed-external-levels': [
              {
                label: 'Pix Boxe 1',
                value: 777,
              },
              {
                label: 'Pix Boxe 2',
                value: 778,
              },
              {
                label: 'Pix Boxe 3',
                value: 779,
              },
            ],
            'default-jury-options': ['REJECTED', 'UNSET'],
            'complementary-certification-course-id': 654,
            'external-result': 'Rejetée',
            'final-result': 'Rejetée',
            'pix-result': 'Pix Boxe 2',
          },
        },
      ]);
    });
  });
});
