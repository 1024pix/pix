import { JuryCertification } from '../../../../src/certification/session-management/domain/models/JuryCertification.js';
import { AutoJuryCommentKeys } from '../../../../src/certification/shared/domain/models/JuryComment.js';
import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | JuryCertification', function () {
  describe('#from', function () {
    let juryCertificationDTO;
    let competenceMarkDTOs;

    beforeEach(function () {
      juryCertificationDTO = {
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
        commentByJury: 'ça va',
        commentByAutoJury: null,
        version: 2,
      };
      competenceMarkDTOs = [
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
    });

    it('should return an instance of JuryCertification', function () {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const certificationIssueReports = [certificationIssueReport];
      const commonComplementaryCertificationCourseResult =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          acquired: true,
        });

      const complementaryCertificationCourseResultWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          complementaryCertificationCourseId: 123,
          pixComplementaryCertificationBadgeId: 98,
          pixAcquired: true,
          externalComplementaryCertificationBadgeId: 99,
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
      const expectedCompetenceMarks = competenceMarkDTOs.map(domainBuilder.buildCompetenceMark);
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
        commentByJury: 'ça va',
        commentByAutoJury: null,
        version: 2,
        competenceMarks: expectedCompetenceMarks,
        certificationIssueReports,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });

    it('should return an instance of JuryCertification with comment by auto jury', function () {
      // given
      juryCertificationDTO.commentByAutoJury = 'FRAUD';

      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const certificationIssueReports = [certificationIssueReport];
      const commonComplementaryCertificationCourseResult =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertification({
          acquired: true,
        });

      const complementaryCertificationCourseResultWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          complementaryCertificationCourseId: 123,
          pixComplementaryCertificationBadgeId: 98,
          pixAcquired: true,
          externalComplementaryCertificationBadgeId: 99,
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
      const expectedCompetenceMarks = competenceMarkDTOs.map(domainBuilder.buildCompetenceMark);
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
        commentByJury: 'ça va',
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        version: 2,
        competenceMarks: expectedCompetenceMarks,
        certificationIssueReports,
        commonComplementaryCertificationCourseResult,
        complementaryCertificationCourseResultWithExternal,
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });
  });
});
