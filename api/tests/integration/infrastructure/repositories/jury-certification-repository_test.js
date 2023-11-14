import { expect, databaseBuilder, domainBuilder, catchErr } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import * as juryCertificationRepository from '../../../../lib/infrastructure/repositories/jury-certification-repository.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

describe('Integration | Infrastructure | Repository | Jury Certification', function () {
  describe('#get', function () {
    it('should throw a NotFoundError when no JuryCertification exists for given certification course id', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 1 });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(juryCertificationRepository.get)(2);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certification course of id 2 does not exist.');
    });

    context('When there is no external jury', function () {
      it('should return the JuryCertification for given certificationCourseId', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 23,
          name: 'Complementary certification without external jury',
          hasExternalJury: false,
        });

        databaseBuilder.factory.buildTargetProfile({ id: 5656, name: 'targetProfile CC 1' });

        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_WITHOUT_EXTERNAL_JURY',
          targetProfileId: 5656,
          complementaryCertificationId: 23,
          complementaryCertificationBadgeId: 3453,
          level: 1,
          label: 'Badge for complementary certification without external jury',
          complementaryCertificationCourse: null,
        });

        databaseBuilder.factory.buildUser({ id: 789 });
        databaseBuilder.factory.buildSession({ id: 456 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 1,
          sessionId: 456,
          userId: 789,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-19',
          sex: 'F',
          birthplace: 'Torreilles',
          birthINSEECode: '66212',
          birthPostalCode: null,
          birthCountry: 'FRANCE',
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-02-01'),
          isPublished: false,
          isCancelled: false,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 456,
          complementaryCertificationId: 23,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3453,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 456,
          complementaryCertificationId: 23,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3453,
        });

        databaseBuilder.factory.buildUser({ id: 22, firstName: 'Jury' });
        databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: 1,
          assessmentId: 159,
          pixScore: 123,
          status: 'validated',
          commentForOrganization: 'Un commentaire orga',
          commentForCandidate: 'Un commentaire candidat',
          commentForJury: 'Un commentaire jury',
          juryId: 22,
        }).id;
        databaseBuilder.factory.buildCompetenceMark({
          id: 123,
          score: 10,
          level: 4,
          competence_code: '2.3',
          area_code: '2',
          competenceId: 'recComp23',
          assessmentResultId,
        });
        await databaseBuilder.commit();

        // when
        const juryCertification = await juryCertificationRepository.get(1);

        // then
        const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
          id: 123,
          score: 10,
          level: 4,
          competence_code: '2.3',
          area_code: '2',
          competenceId: 'recComp23',
          assessmentResultId,
        });
        const expectedJuryCertification = domainBuilder.buildJuryCertification({
          certificationCourseId: 1,
          sessionId: 456,
          userId: 789,
          assessmentId: 159,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthdate: '1981-01-19',
          sex: 'F',
          birthplace: 'Torreilles',
          birthINSEECode: '66212',
          birthPostalCode: null,
          birthCountry: 'FRANCE',
          status: 'validated',
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-02-01'),
          isPublished: false,
          juryId: 22,
          pixScore: 123,
          commentForOrganization: 'Un commentaire orga',
          commentForCandidate: 'Un commentaire candidat',
          commentForJury: 'Un commentaire jury',
          competenceMarks: [expectedCompetenceMark],
          certificationIssueReports: [],
          version: 2,
          commonComplementaryCertificationCourseResult: {
            acquired: true,
            complementaryCertificationBadgeId: 3453,
            id: 456,
            label: 'Badge for complementary certification without external jury',
          },
          complementaryCertificationCourseResultWithExternal: undefined,
        });
        expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
      });
    });

    context('When there is an external jury', function () {
      it('should return the JuryCertification with external', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 24,
          name: 'Complementary certification with external jury',
          hasExternalJury: true,
        });

        databaseBuilder.factory.buildTargetProfile({ id: 5656, name: 'targetProfile CC 1' });

        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_1',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3453,
          level: 1,
          label: 'Badge for complementary certification with external jury level 1',
          complementaryCertificationCourse: null,
        });
        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_2',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3454,
          level: 2,
          label: 'Badge for complementary certification with external jury level 2',
          complementaryCertificationCourse: null,
        });
        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_3',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3455,
          level: 3,
          label: 'Badge for complementary certification with external jury level 3',
          complementaryCertificationCourse: null,
        });

        databaseBuilder.factory.buildUser({ id: 789, firstName: 'Jury' });
        databaseBuilder.factory.buildSession({ id: 456 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 1,
          sessionId: 456,
          userId: 789,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3454,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3453,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3454,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: 1,
          assessmentId: 159,
        });
        await databaseBuilder.commit();

        // when
        const juryCertification = await juryCertificationRepository.get(1);

        // then
        const expectedJuryCertification = {
          complementaryCertificationCourseId: 456,
          externalSection: {
            complementaryCertificationBadgeId: 3454,
            acquired: true,
            label: 'Badge for complementary certification with external jury level 2',
            level: 2,
          },
          pixSection: {
            complementaryCertificationBadgeId: 3453,
            acquired: true,
            label: 'Badge for complementary certification with external jury level 1',
            level: 1,
          },
          allowedExternalLevels: [
            {
              value: 3453,
              label: 'Badge for complementary certification with external jury level 1',
            },
            {
              value: 3454,
              label: 'Badge for complementary certification with external jury level 2',
            },
            {
              value: 3455,
              label: 'Badge for complementary certification with external jury level 3',
            },
          ],
          defaultJuryOptions: ['REJECTED', 'UNSET'],
        };

        expect(juryCertification.complementaryCertificationCourseResultWithExternal).to.deep.equals(
          expectedJuryCertification,
        );
      });
    });

    context('When there are multiple target profile for the current complementary certification', function () {
      it('should return allowed badges for the current target profile only', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 24,
          name: 'Complementary certification with external jury',
          hasExternalJury: true,
        });

        databaseBuilder.factory.buildTargetProfile({ id: 5656, name: 'targetProfile CC 1' });
        databaseBuilder.factory.buildTargetProfile({ id: 5657, name: 'targetProfile CC 1 (other)' });

        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_1',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3453,
          level: 1,
          label: 'Badge for complementary certification with external jury level 1',
          complementaryCertificationCourse: null,
        });
        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_2',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3454,
          level: 2,
          label: 'Badge for complementary certification with external jury level 2',
          complementaryCertificationCourse: null,
        });
        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_WITH_EXTERNAL_JURY_LEVEL_3',
          targetProfileId: 5656,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3455,
          level: 3,
          label: 'Badge for complementary certification with external jury level 3',
          complementaryCertificationCourse: null,
        });

        _buildComplementaryBadge({
          key: 'BADGE_FOR_COMPLEMENTARY_CERTIFICATION_1_OTHER_RT',
          targetProfileId: 5657,
          complementaryCertificationId: 24,
          complementaryCertificationBadgeId: 3456,
          level: 1,
          label: 'Badge for complementary certification other RT',
          complementaryCertificationCourse: null,
        });

        databaseBuilder.factory.buildUser({ id: 789, firstName: 'Jury' });
        databaseBuilder.factory.buildSession({ id: 456 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 1,
          sessionId: 456,
          userId: 789,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3454,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3454,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 456,
          complementaryCertificationId: 24,
          certificationCourseId: 1,
          complementaryCertificationBadgeId: 3455,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });

        databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: 1,
          assessmentId: 159,
        }).id;
        databaseBuilder.factory.buildCompetenceMark({
          assessmentResultId,
        });
        await databaseBuilder.commit();

        // when
        const { complementaryCertificationCourseResultWithExternal } = await juryCertificationRepository.get(1);

        // then
        expect(complementaryCertificationCourseResultWithExternal.allowedExternalLevels).to.deep.equals([
          {
            value: 3453,
            label: 'Badge for complementary certification with external jury level 1',
          },
          {
            value: 3454,
            label: 'Badge for complementary certification with external jury level 2',
          },
          {
            value: 3455,
            label: 'Badge for complementary certification with external jury level 3',
          },
        ]);
      });
    });

    it('should return along the certificationIssueReports if any ordered by ID', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 1 });
      databaseBuilder.factory.buildCertificationCourse({ id: 2 });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
      const issueReportCategoryId1 = databaseBuilder.factory.buildIssueReportCategory({ name: 'first_category' }).id;
      const issueReportCategoryId2 = databaseBuilder.factory.buildIssueReportCategory({ name: 'second_category' }).id;
      const expectedCertificationIssueReportA = domainBuilder.buildCertificationIssueReport.impactful({
        id: 456,
        certificationCourseId: 1,
        categoryId: issueReportCategoryId1,
        description: 'une description 1',
        questionNumber: 1,
        resolvedAt: new Date('2022-05-05'),
        resolution: 'super',
        hasBeenAutomaticallyResolved: false,
      });
      const expectedCertificationIssueReportB = domainBuilder.buildCertificationIssueReport.notImpactful({
        id: 123,
        certificationCourseId: 1,
        categoryId: issueReportCategoryId2,
        description: 'une description 2',
        questionNumber: 12,
        resolvedAt: new Date('2021-12-25'),
        resolution: 'les doigts dans le nez',
        hasBeenAutomaticallyResolved: false,
      });
      const anotherIssueReport = domainBuilder.buildCertificationIssueReport.notImpactful({
        id: 789,
        certificationCourseId: 2,
      });
      databaseBuilder.factory.buildCertificationIssueReport(expectedCertificationIssueReportA);
      databaseBuilder.factory.buildCertificationIssueReport(expectedCertificationIssueReportB);
      databaseBuilder.factory.buildCertificationIssueReport(anotherIssueReport);
      await databaseBuilder.commit();

      // when
      const juryCertification = await juryCertificationRepository.get(1);

      // then
      expect(juryCertification.certificationIssueReports).to.deepEqualArray([
        expectedCertificationIssueReportB,
        expectedCertificationIssueReportA,
      ]);
    });
  });
});

function _buildComplementaryBadge({
  key,
  targetProfileId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
  level,
  label,
}) {
  const { id: badgeId } = databaseBuilder.factory.buildBadge({
    key,
    targetProfileId,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: complementaryCertificationBadgeId,
    complementaryCertificationId,
    badgeId,
    label,
    level,
  });
}
