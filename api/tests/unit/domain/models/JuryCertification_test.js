import { expect, domainBuilder } from '../../../test-helper.js';
import { JuryCertification } from '../../../../lib/domain/models/JuryCertification.js';

describe('Unit | Domain | Models | JuryCertification', function () {
  describe('#from', function () {
    let juryCertificationBaseDTO;

    beforeEach(function () {
      juryCertificationBaseDTO = {
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isCancelled: true,
        isPublished: true,
        isRejectedForFraud: false,
        assessmentResultStatus: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentForJury: 'ça va',
        version: 2,
      };
    });

    it('should return an instance of JuryCertification', function () {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const juryCertificationDTO = {
        ...juryCertificationBaseDTO,
      };
      const certificationIssueReports = [certificationIssueReport];
      const commonComplementaryCertificationCourseResult =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          partnerKey: 'PIX_PARTNER_KEY',
          acquired: true,
        });

      const competenceMarkDTOs = [
        {
          id: 123,
          score: 10,
          level: 4,
          area_code: '2',
          competence_code: '2.3',
          assessmentResultId: 753,
          competenceId: 'recComp23',
        },
      ];

      const complementaryCertificationCourseResultWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          complementaryCertificationCourseId: 123,
          pixPartnerKey: 'PIX_PARTNER_KEY',
          pixAcquired: true,
          externalPartnerKey: 'PIX_PARTNER_KEY_EXTERNAL',
          externalAcquired: true,
        });

      // when
      const juryCertification = JuryCertification.from({
        juryCertificationDTO,
        certificationIssueReports,
        competenceMarkDTOs,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });

      // then
      const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
        id: 123,
        level: 4,
        score: 10,
        area_code: '2',
        competence_code: '2.3',
        competenceId: 'recComp23',
        assessmentResultId: 753,
      });
      const expectedJuryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isCancelled: true,
        isPublished: true,
        isRejectedForFraud: false,
        status: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentForJury: 'ça va',
        version: 2,
        competenceMarks: [expectedCompetenceMark],
        certificationIssueReports,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });
  });
});
