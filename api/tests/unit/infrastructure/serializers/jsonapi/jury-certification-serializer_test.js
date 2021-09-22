const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-serializer');

describe('Unit | Serializer | JSONAPI | jury-certification-serializer', function() {

  describe('#serialize', function() {

    it('should serialize a JuryCertification', function() {
      // given
      const certificationCourseId = 123;
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport.impactful({
        certificationCourseId,
        resolvedAt: new Date(),
        resolution: 'le challenge est neutralisé',
      });
      const certificationIssueReports = [ certificationIssueReport ];
      const competenceMarks = [ domainBuilder.buildCompetenceMark() ];
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
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
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
        certificationIssueReports,
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
            'clea-certification-status': 'not_taken',
            'pix-plus-droit-maitre-certification-status': 'acquired',
            'pix-plus-droit-expert-certification-status': 'rejected',
          },
          relationships: {
            'certification-issue-reports': {
              data: [{
                type: 'certificationIssueReports',
                id: certificationIssueReport.id.toString(),
              }],
            },
          },
        },
        included: [{
          type: 'certificationIssueReports',
          id: certificationIssueReport.id.toString(),
          attributes: {
            category: certificationIssueReport.category,
            description: certificationIssueReport.description,
            'is-impactful': true,
            'resolved-at': certificationIssueReport.resolvedAt,
            'resolution': certificationIssueReport.resolution,
            'question-number': certificationIssueReport.questionNumber,
            subcategory: certificationIssueReport.subcategory,
          },
        }],
      };
      expect(serializedJuryCertification).to.deep.equal(expectedSerializedCertification);
    });
  });
});
