import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as issueReportCategoryRepository from '../../../../../../src/certification/shared/infrastructure/repositories/issue-report-category-repository.js';

describe('Integration | Repository | Issue Report Categories', function () {
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
