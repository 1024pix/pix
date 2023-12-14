import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationIssueReportCategory } from '../../../issue-reports/domain/read-models/CertificationIssueReportCategory.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';

function _toDomain(issueReportCategoryModel) {
  return new CertificationIssueReportCategory({ id: issueReportCategoryModel.id });
}

const get = async function ({ name }) {
  const issueReportCategory = await knex('issue-report-categories').where({ name }).first();

  if (!issueReportCategory) {
    throw new NotFoundError('The issue report category name does not exist');
  }
  return _toDomain(issueReportCategory);
};

export { get };
