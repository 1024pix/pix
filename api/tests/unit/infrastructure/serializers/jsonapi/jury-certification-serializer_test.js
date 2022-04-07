const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-serializer');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
} = require('../../../../../lib/domain/models/Badge').keys;

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
        complementaryCertificationCourseResults: [
          domainBuilder.buildComplementaryCertificationCourseResult({
            partnerKey: PIX_DROIT_MAITRE_CERTIF,
            acquired: true,
          }),
          domainBuilder.buildComplementaryCertificationCourseResult({
            partnerKey: PIX_DROIT_EXPERT_CERTIF,
            acquired: false,
          }),
          domainBuilder.buildComplementaryCertificationCourseResult({
            partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
            acquired: true,
          }),
          domainBuilder.buildComplementaryCertificationCourseResult({
            partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
            acquired: false,
          }),
        ],
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
            'pix-plus-edu-initie-certification-status': 'not_taken',
            'pix-plus-edu-confirme-certification-status': 'acquired',
            'pix-plus-edu-avance-certification-status': 'rejected',
            'pix-plus-edu-expert-certification-status': 'not_taken',
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
          },
        },
        included: [
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
