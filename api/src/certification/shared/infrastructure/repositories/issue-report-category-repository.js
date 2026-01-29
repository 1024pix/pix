import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationIssueReportCategory } from '../../domain/read-models/CertificationIssueReportCategory.js';

function _toDomain(issueReportCategoryModel) {
  return new CertificationIssueReportCategory({ id: issueReportCategoryModel.id });
}

const get = async function ({ name }) {
  const knexConn = DomainTransaction.getConnection();
  const issueReportCategory = await knexConn('issue-report-categories').where({ name }).first();

  if (!issueReportCategory) {
    throw new NotFoundError('The issue report category name does not exist');
  }
  return _toDomain(issueReportCategory);
};

export { get };
