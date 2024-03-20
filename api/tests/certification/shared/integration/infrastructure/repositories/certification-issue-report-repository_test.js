import _ from 'lodash';

import { CertificationIssueReport } from '../../../../../../src/certification/shared/domain/models/CertificationIssueReport.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import * as certificationIssueReportRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification Issue Report', function () {
  describe('#save', function () {
    describe('when there is no corresponding issue report', function () {
      it('should persist the certif issue report in db', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;

        await databaseBuilder.commit();

        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          id: undefined,
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          categoryId: null,
          description: 'Un gros problème',
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: null,
          resolution: null,
        });

        // when
        const savedCertificationIssueReport = await certificationIssueReportRepository.save({
          certificationIssueReport,
        });

        // then
        const expectedSavedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          categoryId: null,
          description: 'Un gros problème',
          isActionRequired: true,
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 5,
          resolvedAt: null,
          resolution: null,
        });

        expect(_.omit(savedCertificationIssueReport, 'id')).to.deep.equal(
          _.omit(expectedSavedCertificationIssueReport, 'id'),
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
          name: CertificationIssueReportCategory.IN_CHALLENGE,
        });
        const categoryId = databaseBuilder.factory.buildIssueReportCategory({
          issueReportCategoryId: 2,
          name: CertificationIssueReportCategory.IMAGE_NOT_DISPLAYING,
        }).id;
        const certificationIssueReport = databaseBuilder.factory.buildCertificationIssueReport({
          id: 1234,
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
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
        const savedCertificationIssueReport = await certificationIssueReportRepository.save({
          certificationIssueReport: updatedIssueReport,
        });

        // then
        const expectedSavedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
          id: 1234,
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
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
      await certificationIssueReportRepository.remove({ id: certificationIssueReportToDeleteId });

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
      const result = await certificationIssueReportRepository.get({ id: issueReport.id });

      // then
      const expectedIssueReport = domainBuilder.buildCertificationIssueReport({
        ...issueReport,
      });

      expect(result).to.deep.equal(expectedIssueReport);
      expect(result).to.be.instanceOf(CertificationIssueReport);
    });

    context('when the issue report does not exists', function () {
      it('should throw NotFoundError', async function () {
        // given
        const unknownCertificationIssueReportId = 999999;

        // when
        const error = await catchErr(certificationIssueReportRepository.get)({ id: unknownCertificationIssueReportId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`Certification issue report 999999 does not exist`);
      });
    });
  });

  describe('#findByCertificationCourseId', function () {
    it('should return certification issue reports for a certification course id', async function () {
      // given
      const targetCertificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const categoryId = databaseBuilder.factory.buildIssueReportCategory({
        name: CertificationIssueReportCategory.OTHER,
      }).id;
      const otherCertificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const issueReportForTargetCourse1 = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: targetCertificationCourse.id,
        category: CertificationIssueReportCategory.OTHER,
        categoryId,
      });
      const issueReportForTargetCourse2 = databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: targetCertificationCourse.id,
        category: CertificationIssueReportCategory.OTHER,
        categoryId,
      });
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: otherCertificationCourse.id,
        category: CertificationIssueReportCategory.OTHER,
        categoryId,
      });
      await databaseBuilder.commit();

      // when
      const results = await certificationIssueReportRepository.findByCertificationCourseId({
        certificationCourseId: targetCertificationCourse.id,
      });

      // then
      const expectedIssueReports = [
        domainBuilder.buildCertificationIssueReport(issueReportForTargetCourse1),
        domainBuilder.buildCertificationIssueReport(issueReportForTargetCourse2),
      ];
      expect(results).to.deep.equal(expectedIssueReports);
      expect(results[0]).to.be.instanceOf(CertificationIssueReport);
    });
  });
});
