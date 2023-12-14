import { expect, databaseBuilder, catchErr } from '../../../../../test-helper.js';
import * as issueReportCategoryRepository from '../../../../../../src/certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import { CertificationIssueReportCategory } from '../../../../../../src/certification/issue-reports/domain/read-models/CertificationIssueReportCategory.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

describe('Integration | Repository | Issue Report Categories', function () {
  describe('#get', function () {
    describe('when the issue report category name exists', function () {
      it('should return a CertificationIssueReportCategory domain read model', async function () {
        // given
        const categoryId = 1;
        const issueReportCategory = databaseBuilder.factory.buildIssueReportCategory({
          id: categoryId,
          category: 'OTHER',
        });
        await databaseBuilder.commit();

        // when
        const result = await issueReportCategoryRepository.get({ name: issueReportCategory.name });

        // then
        expect(result).to.be.instanceof(CertificationIssueReportCategory);
        expect(result.id).to.equal(categoryId);
      });
    });

    describe('when the issue report category name does not exist', function () {
      it('should throw a Not Found domain error', async function () {
        // given
        databaseBuilder.factory.buildIssueReportCategory({ category: 'OTHER', name: 'Some problem' });
        await databaseBuilder.commit();

        // when
        const nonExistingCategoryName = 'NON_EXISTING_CATEGORY_NAME';
        const result = await catchErr(issueReportCategoryRepository.get)({ name: nonExistingCategoryName });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
        expect(result.message).to.equal(`The issue report category name does not exist`);
      });
    });
  });
});
