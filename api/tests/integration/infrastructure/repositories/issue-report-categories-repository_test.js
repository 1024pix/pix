import { expect, databaseBuilder, knex } from '../../../test-helper';
import issueReportCategoryRepository from '../../../../lib/infrastructure/repositories/issue-report-category-repository';

describe('Integration | Repository | Issue Report Categories', function () {
  afterEach(async function () {
    await knex('issue-report-categories').delete();
  });

  describe('#get', function () {
    it('should return a certification issue report', async function () {
      // given
      const issueReportCategory = databaseBuilder.factory.buildIssueReportCategory({ category: 'OTHER' });
      await databaseBuilder.commit();

      // when
      const result = await issueReportCategoryRepository.get({ name: issueReportCategory.name });

      // then
      expect(result).to.deep.equal({ ...issueReportCategory });
    });
  });
});
