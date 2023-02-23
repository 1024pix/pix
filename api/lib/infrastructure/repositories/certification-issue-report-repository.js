const omit = require('lodash/omit');
const { knex } = require('../../../db/knex-database-connection.js');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport.js');

module.exports = {
  async save(certificationIssueReport) {
    const [data] = await knex
      .from('certification-issue-reports')
      .insert(omit(certificationIssueReport, ['isImpactful']))
      .onConflict(['id'])
      .merge()
      .returning('*');

    return new CertificationIssueReport(data);
  },

  async get(id) {
    const certificationIssueReport = await knex('certification-issue-reports').where({ id }).first();
    return new CertificationIssueReport(certificationIssueReport);
  },

  async findByCertificationCourseId(certificationCourseId) {
    const certificationIssueReports = await knex('certification-issue-reports').where({ certificationCourseId });
    return certificationIssueReports.map(
      (certificationIssueReport) => new CertificationIssueReport(certificationIssueReport)
    );
  },

  async delete(id) {
    return knex('certification-issue-reports').where({ id }).del();
  },
};
