import _ from 'lodash';
import { expect, domainBuilder, databaseBuilder, knex } from '../../../test-helper';
import certificationIssueReportRepository from '../../../../lib/infrastructure/repositories/certification-issue-report-repository';
import CertificationIssueReport from '../../../../lib/domain/models/CertificationIssueReport';
import {
  CertificationIssueReportCategories,
  CertificationIssueReportSubcategories,
} from '../../../../lib/domain/models/CertificationIssueReportCategory';

describe('Integration | Repository | Certification Issue Report', function () {
  afterEach(async function () {
    await knex('certification-issue-reports').delete();
  });

  describe('#save', function () {
    describe('when there is no corresponding issue report', function () {
      it('should persist the certif issue report in db', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;

        await databaseBuilder.commit();

        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          id: undefined,
          certificationCourseId,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          categoryId: null,
          description: 'Un gros problème',
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: null,
          resolution: null,
        });

        // when
        const savedCertificationIssueReport = await certificationIssueReportRepository.save(certificationIssueReport);

        // then
        const expectedSavedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          certificationCourseId,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          categoryId: null,
          description: 'Un gros problème',
          isActionRequired: true,
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: null,
          resolution: null,
        });

        expect(_.omit(savedCertificationIssueReport, 'id')).to.deep.equal(
          _.omit(expectedSavedCertificationIssueReport, 'id')
        );
        expect(savedCertificationIssueReport).to.be.an.instanceOf(CertificationIssueReport);
      });
    });

    describe('when there is a corresponding issue report', function () {
      it('should persist the updated certif issue report in db', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        databaseBuilder.factory.buildIssueReportCategory({
          id: 123,
          name: CertificationIssueReportCategories.IN_CHALLENGE,
        });
        const categoryId = databaseBuilder.factory.buildIssueReportCategory({
          issueReportCategoryId: 2,
          name: CertificationIssueReportCategories.IMAGE_NOT_DISPLAYING,
        }).id;
        const certificationIssueReport = databaseBuilder.factory.buildCertificationIssueReport({
          id: 1234,
          certificationCourseId,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          categoryId,
          description: 'Un gros problème',
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: null,
          resolution: null,
        });

        await databaseBuilder.commit();

        const updatedIssueReport = {
          ...certificationIssueReport,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'coucou',
        };

        // when
        const savedCertificationIssueReport = await certificationIssueReportRepository.save(updatedIssueReport);

        // then
        const expectedSavedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          id: 1234,
          certificationCourseId,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          categoryId,
          description: 'Un gros problème',
          isActionRequired: true,
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: new Date('2020-01-01'),
          resolution: 'coucou',
        });

        expect(savedCertificationIssueReport).to.deepEqualInstance(expectedSavedCertificationIssueReport);
      });
    });
  });

  describe('#delete', function () {
    it('should delete the issue report', async function () {
      // given
      const certificationIssueReportToDeleteId = databaseBuilder.factory.buildCertificationIssueReport().id;
      databaseBuilder.factory.buildCertificationIssueReport();
      await databaseBuilder.commit();

      // when
      await certificationIssueReportRepository.delete(certificationIssueReportToDeleteId);

      // then
      const exists = await knex('certification-issue-reports')
        .where({ id: certificationIssueReportToDeleteId })
        .first();
      expect(Boolean(exists)).to.be.false;
    });
  });

  describe('#get', function () {
    it('should return a certification issue report', async function () {
      // given
      const issueReport = databaseBuilder.factory.buildCertificationIssueReport({ category: 'OTHER' });
      await databaseBuilder.commit();

      // when
      const result = await certificationIssueReportRepository.get(issueReport.id);

      // then
      const expectedIssueReport = domainBuilder.buildCertificationIssueReport({
        ...issueReport,
      });

      expect(result).to.deep.equal(expectedIssueReport);
      expect(result).to.be.instanceOf(CertificationIssueReport);
    });
  });

  describe('#findByCertificationCourseId', function () {
    it('should return certification issue reports for a certification course id', async function () {
      // given
      const targetCertificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const categoryId = databaseBuilder.factory.buildIssueReportCategory({
        name: CertificationIssueReportCategories.OTHER,
      }).id;
      const otherCertificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const issueReportForTargetCourse1 = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: targetCertificationCourse.id,
        category: CertificationIssueReportCategories.OTHER,
        categoryId,
      });
      const issueReportForTargetCourse2 = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: targetCertificationCourse.id,
        category: CertificationIssueReportCategories.OTHER,
        categoryId,
      });
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: otherCertificationCourse.id,
        category: CertificationIssueReportCategories.OTHER,
        categoryId,
      });
      await databaseBuilder.commit();

      // when
      const results = await certificationIssueReportRepository.findByCertificationCourseId(
        targetCertificationCourse.id
      );

      // then
      const expectedIssueReports = [
        new CertificationIssueReport(issueReportForTargetCourse1),
        new CertificationIssueReport(issueReportForTargetCourse2),
      ];
      expect(results).to.deep.equal(expectedIssueReports);
      expect(results[0]).to.be.instanceOf(CertificationIssueReport);
    });
  });
});
