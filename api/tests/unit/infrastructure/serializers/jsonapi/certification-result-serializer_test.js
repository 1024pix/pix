const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-result-serializer');
const CertificationResult = require('../../../../../lib/domain/models/CertificationResult');
const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReport = require('../../../../../lib/domain/models/CertificationIssueReport');

describe('Unit | Serializer | JSONAPI | certification-result-serializer', function() {

  describe('#serialize', function() {

    it('should serialize results of a certification', function() {
      // given
      const lastAssessmentResult = domainBuilder.buildAssessmentResult({
        createdAt: new Date('2017-02-20T01:02:03Z'),
        pixScore: 30,
        status: 'validated',
        emitter: 'PIX_ALGO',
        commentForCandidate: null,
        commentForJury: 'Salut',
        commentForOrganization: '',
        competenceMarks: [],
        juryId: 21,
      });
      const certificationCourseId = 1;
      const certificationResult = new CertificationResult({
        id: certificationCourseId,
        lastAssessmentResult,
        firstName: 'Guy-Manuel',
        lastName: 'De Homem Christo',
        birthdate: '1974-02-08',
        birthplace: 'Neuilly-Sur-Seine',
        externalId: 'Grammys2016',
        createdAt: new Date('2017-02-20T01:02:03Z'),
        completedAt: new Date('2017-02-20T01:02:03Z'),
        isPublished: true,
        isV2Certification: true,
        certificationIssueReports: [
          new CertificationIssueReport({
            id: 42,
            certificationCourseId: certificationCourseId,
            category: CertificationIssueReportCategories.OTHER,
            description: 'un commentaire',
          }),
          new CertificationIssueReport({
            id: 43,
            certificationCourseId: certificationCourseId,
            category: CertificationIssueReportCategories.OTHER,
            description: 'un autre commentaire',
          }),
        ],
        hasSeenEndTestScreen: true,
        cleaCertificationStatus: 'acquired',
        sessionId: 22,
        assessmentId: 99,
      });
      const jsonApiDataRelationship = {
        data: [{
          type: 'certificationIssueReports',
          id: '42',
        },
        {
          type: 'certificationIssueReports',
          id: '43',
        }],
      };
      const jsonApiDataIncluded = [{
        type: 'certificationIssueReports',
        id: '42',
        attributes: {
          category: CertificationIssueReportCategories.OTHER,
          description: 'un commentaire',
          'is-action-required': true,
          'question-number': null,
          subcategory: null,
        },
      },
      {
        type: 'certificationIssueReports',
        id: '43',
        attributes: {
          category: CertificationIssueReportCategories.OTHER,
          description: 'un autre commentaire',
          'is-action-required': true,
          'question-number': null,
          subcategory: null,
        },
      }];

      // when
      const serializedCertificationCourse = serializer.serialize(certificationResult);

      // then
      expect(serializedCertificationCourse).to.deep.equal({
        data: {
          id: certificationResult.id.toString(),
          type: 'certifications',
          attributes: {
            birthdate: certificationResult.birthdate,
            birthplace: certificationResult.birthplace,
            'comment-for-candidate': certificationResult.commentForCandidate,
            'comment-for-jury': certificationResult.commentForJury,
            'comment-for-organization': certificationResult.commentForOrganization,
            'has-seen-end-test-screen': true,
            'clea-certification-status': certificationResult.cleaCertificationStatus,
            'competences-with-mark': certificationResult.competencesWithMark,
            'completed-at': new Date('2017-02-20T01:02:03Z'),
            'created-at': new Date('2017-02-20T01:02:03Z'),
            emitter: certificationResult.emitter,
            'examiner-comment': 'un commentaire',
            'external-id': certificationResult.externalId,
            'first-name': certificationResult.firstName,
            'is-published': certificationResult.isPublished,
            'is-v2-certification': certificationResult.isV2Certification,
            'jury-id': certificationResult.juryId,
            'last-name': certificationResult.lastName,
            'pix-score': certificationResult.pixScore,
            'result-created-at': new Date('2017-02-20T01:02:03Z'),
            'session-id': certificationResult.sessionId,
            'assessment-id': certificationResult.assessmentId,
            status: certificationResult.status,
          },
          relationships: {
            'certification-issue-reports': jsonApiDataRelationship,
          },
        },
        included: jsonApiDataIncluded,
      });
    });
  });
});
