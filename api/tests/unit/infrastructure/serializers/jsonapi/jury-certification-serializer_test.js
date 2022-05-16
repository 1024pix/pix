const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-serializer');
const Badge = require('../../../../../lib/domain/models/Badge');

describe('Unit | Serializer | JSONAPI | jury-certification-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a JuryCertification', function () {
      // given
      const certificationCourseId = 123;
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport.impactful({
        certificationCourseId,
        resolvedAt: new Date(),
        resolution: 'le challenge est neutralisé',
      });
      const certificationIssueReports = [certificationIssueReport];
      const competenceMarks = [domainBuilder.buildCompetenceMark()];
      const juryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId,
        sessionId: 11,
        userId: 867,
        assessmentId: 44,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        status: 'validated',
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentForJury: 'ça va',
        competenceMarks,
        certificationIssueReports,
        commonComplementaryCertificationCourseResults: [
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
            id: 12,
            partnerKey: Badge.keys.PIX_DROIT_EXPERT_CERTIF,
            acquired: true,
          }),
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
            id: 14,
            partnerKey: Badge.keys.PIX_EMPLOI_CLEA_V3,
            acquired: true,
          }),
        ],
        complementaryCertificationCourseResultsWithExternal:
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            complementaryCertificationCourseId: 1234,
            pixPartnerKey: Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
            pixAcquired: true,
            externalPartnerKey: Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
            externalAcquired: true,
          }),
      });

      // when
      const serializedJuryCertification = serializer.serialize(juryCertification);

      // then
      const expectedSerializedCertification = {
        data: {
          id: certificationCourseId.toString(),
          type: 'certifications',
          attributes: {
            'session-id': 11,
            'user-id': 867,
            'assessment-id': 44,
            'first-name': 'James',
            'last-name': 'Watt',
            birthdate: '1990-01-04',
            birthplace: 'Somewhere',
            sex: 'M',
            'birth-country': 'ENGLAND',
            'birth-insee-code': '99124',
            'birth-postal-code': null,
            'created-at': new Date('2020-02-20T10:30:00Z'),
            'completed-at': new Date('2020-02-20T11:00:00Z'),
            status: 'validated',
            'is-published': true,
            'jury-id': 1,
            'pix-score': 555,
            'competences-with-mark': juryCertification.competenceMarks,
            'comment-for-candidate': 'coucou',
            'comment-for-jury': 'ça va',
            'comment-for-organization': 'comment',
          },
          relationships: {
            'certification-issue-reports': {
              data: [
                {
                  type: 'certificationIssueReports',
                  id: certificationIssueReport.id.toString(),
                },
              ],
            },
            'common-complementary-certification-course-results': {
              data: [
                {
                  id: '12',
                  type: 'commonComplementaryCertificationCourseResults',
                },
                {
                  id: '14',
                  type: 'commonComplementaryCertificationCourseResults',
                },
              ],
            },
            'complementary-certification-course-results-with-external': {
              data: {
                id: '1234',
                type: 'complementaryCertificationCourseResultsWithExternals',
              },
            },
          },
        },
        included: [
          {
            type: 'commonComplementaryCertificationCourseResults',
            id: '12',
            attributes: {
              label: 'Pix+ Droit Expert',
              status: 'Validée',
            },
          },
          {
            type: 'commonComplementaryCertificationCourseResults',
            id: '14',
            attributes: {
              label: 'CléA Numérique',
              status: 'Validée',
            },
          },
          {
            type: 'complementaryCertificationCourseResultsWithExternals',
            id: '1234',
            attributes: {
              'complementary-certification-course-id': 1234,
              'pix-result': 'Pix+ Édu 1er degré Avancé',
              'external-result': 'Pix+ Édu 1er degré Avancé',
              'final-result': 'Pix+ Édu 1er degré Avancé',
            },
          },
          {
            type: 'certificationIssueReports',
            id: certificationIssueReport.id.toString(),
            attributes: {
              category: certificationIssueReport.category,
              description: certificationIssueReport.description,
              'is-impactful': true,
              'resolved-at': certificationIssueReport.resolvedAt,
              resolution: certificationIssueReport.resolution,
              'question-number': certificationIssueReport.questionNumber,
              subcategory: certificationIssueReport.subcategory,
            },
          },
        ],
      };
      expect(serializedJuryCertification).to.deep.equal(expectedSerializedCertification);
    });
  });
});
