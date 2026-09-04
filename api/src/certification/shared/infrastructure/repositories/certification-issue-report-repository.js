import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';

export async function save({ certificationIssueReport }) {
  const knexConn = DomainTransaction.getConnection();

  //eslint-disable-next-line no-unused-vars
  const { isImpactful, ...certificationIssueReportWithoutIsImpactful } = certificationIssueReport;

  const [data] = await knexConn
    .from('certification-issue-reports')
    .insert(certificationIssueReportWithoutIsImpactful)
    .onConflict(['id'])
    .merge()
    .returning('*');

  return new CertificationIssueReport(data);
}

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationIssueReport = await knexConn('certification-issue-reports').where({ id }).first();
  if (!certificationIssueReport) {
    throw new NotFoundError(`Certification issue report ${id} does not exist`);
  }
  return new CertificationIssueReport(certificationIssueReport);
}

export async function findByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationIssueReports = await knexConn('certification-issue-reports').where({ certificationCourseId });
  return certificationIssueReports.map(
    (certificationIssueReport) => new CertificationIssueReport(certificationIssueReport),
  );
}

export async function remove({ id }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-issue-reports').where({ id }).del();
}
