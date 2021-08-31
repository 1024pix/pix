const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-serializer');
const JuryCertification = require('../../../../../lib/domain/models/JuryCertification');
const Assessment = require('../../../../../lib/domain/models/Assessment');

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
      const juryCertificationDTO = {
        certificationCourseId,
        sessionId: 11,
        status: Assessment.states.COMPLETED,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '07-11-1950',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        birthplace: 'Somewhere',
        userI: 867,
        certificationIssueReports,
        assessmentId: 44,
        commentForCandidate: null,
        commentForOrganization: null,
        commentForJury: null,
        juryId: 1,
        pixScore: 555,
        competenceMarks,
      };
      const juryCertification = new JuryCertification(juryCertificationDTO);

      // when
      const serializedJuryCertification = serializer.serialize(juryCertification);

      // then
      const expectedSerializedCertification = {
        data: {
          id: certificationCourseId.toString(),
          type: 'certifications',
          attributes: {
            'session-id': juryCertificationDTO.sessionId,
            status: juryCertificationDTO.status,
            'created-at': new Date('2020-02-20T10:30:00Z'),
            'completed-at': new Date('2020-02-20T11:00:00Z'),
            'is-published': juryCertificationDTO.isPublished,
            'clea-certification-status': 'not_taken',
            'pix-plus-droit-maitre-certification-status': 'acquired',
            'pix-plus-droit-expert-certification-status': 'rejected',
            'first-name': juryCertificationDTO.firstName,
            'last-name': juryCertificationDTO.lastName,
            birthdate: juryCertificationDTO.birthdate,
            birthplace: juryCertificationDTO.birthplace,
            'birth-country': juryCertificationDTO.birthCountry,
            'birth-insee-code': juryCertificationDTO.birthINSEECode,
            'birth-postal-code': null,
            sex: 'M',
            'user-id': juryCertificationDTO.userId,
            'assessment-id': juryCertificationDTO.assessmentId,
            'comment-for-candidate': juryCertificationDTO.commentForCandidate,
            'comment-for-jury': juryCertificationDTO.commentForJury,
            'comment-for-organization': juryCertificationDTO.commentForOrganization,
            'jury-id': juryCertificationDTO.juryId,
            'pix-score': juryCertificationDTO.pixScore,
            'competences-with-mark': juryCertificationDTO.competenceMarks,
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
