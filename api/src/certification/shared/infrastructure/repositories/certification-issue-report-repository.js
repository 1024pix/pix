import lodash from 'lodash';

const { omit } = lodash;

import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';

const save = async function (certificationIssueReport) {
  const [data] = await knex
    .from('certification-issue-reports')
    .insert(omit(certificationIssueReport, ['isImpactful']))
    .onConflict(['id'])
    .merge()
    .returning('*');

  return new CertificationIssueReport(data);
};

const get = async function ({ id }) {
  const certificationIssueReport = await knex('certification-issue-reports').where({ id }).first();
  if (!certificationIssueReport) {
    throw new NotFoundError(`Certification issue report ${id} does not exist`);
  }
  return new CertificationIssueReport(certificationIssueReport);
};

const findByCertificationCourseId = async function ({ certificationCourseId }) {
  const certificationIssueReports = await knex('certification-issue-reports').where({ certificationCourseId });
  return certificationIssueReports.map(
    (certificationIssueReport) => new CertificationIssueReport(certificationIssueReport),
  );
};

const remove = async function ({ id }) {
  return knex('certification-issue-reports').where({ id }).del();
};

export { findByCertificationCourseId, get, remove, save };
