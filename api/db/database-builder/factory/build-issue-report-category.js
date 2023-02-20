import databaseBuffer from '../database-buffer';

export default function buildIssueReportCategory({
  id = databaseBuffer.getNextId(),
  name = 'Some problem',
  isDeprecated = false,
  isImpactful = false,
  issueReportCategoryId = null,
} = {}) {
  const values = {
    id,
    name,
    isDeprecated,
    isImpactful,
    issueReportCategoryId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'issue-report-categories',
    values,
  });
}
