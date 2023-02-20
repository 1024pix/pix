import { expect, databaseBuilder, knex } from '../../../test-helper';
import { main } from '../../../../scripts/certification/fill-issue-report-category-id';

describe('Integration | Scripts | Certification | fill-issue-report-category-id', function () {
  describe('#updateCertificationIssueReport', function () {
    context('when there is no subcategory', function () {
      it('returns a certification issue report updated with a categoryId', async function () {
        // given
        const candidateFraudId = databaseBuilder.factory.buildIssueReportCategory({
          name: 'FRAUD',
          isDeprecated: false,
          isImpactful: true,
        }).id;

        databaseBuilder.factory.buildCertificationIssueReport({
          id: 1,
          category: 'FRAUD',
          categoryId: null,
        });

        await databaseBuilder.commit();

        // when
        await main();

        // then
        const certificationIssueReport = await knex('certification-issue-reports')
          .select('id', 'category', 'subcategory', 'categoryId')
          .where('id', 1)
          .first();
        expect(certificationIssueReport.categoryId).to.equal(candidateFraudId);
      });
    });

    context('when there is a subcategory', function () {
      it('returns a certification issue report updated with a categoryId from a subcategory', async function () {
        // given
        const issueReportCategoryId = databaseBuilder.factory.buildIssueReportCategory({
          name: 'OTHER',
          isDeprecated: true,
          isImpactful: true,
        }).id;
        const subCategoryId = databaseBuilder.factory.buildIssueReportCategory({
          name: 'LEFT_EXAM_ROOM',
          isDeprecated: true,
          isImpactful: false,
          issueReportCategoryId,
        }).id;

        databaseBuilder.factory.buildCertificationIssueReport({
          id: 1,
          category: 'LEFT_EXAM_ROOM',
          categoryId: null,
        });

        await databaseBuilder.commit();

        // when
        await main();

        // then
        const certificationIssueReport = await knex('certification-issue-reports')
          .select('id', 'category', 'subcategory', 'categoryId')
          .where('id', 1)
          .first();
        expect(certificationIssueReport.categoryId).to.equal(subCategoryId);
      });
    });
  });
});
