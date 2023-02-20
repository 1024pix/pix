import logger from '../../lib/infrastructure/logger';
import { knex, disconnect } from '../../db/knex-database-connection';
import bluebird from 'bluebird';

const isLaunchedFromCommandLine = require.main === module;

async function _getIdCategorySubcategoryFromCertificationIssueReport() {
  return knex('certification-issue-reports').select('id', 'category', 'subcategory');
}

async function main() {
  logger.info(`Script ${__filename} est lancé !`);

  const certificationIssueReports = await _getIdCategorySubcategoryFromCertificationIssueReport();

  logger.info(`Nb de certification issue reports à modifier : ${certificationIssueReports.length}`);

  const categories = await knex('issue-report-categories').select('name', 'id');

  await _updateIssueReportsWithCategoryId(certificationIssueReports, categories);

  const { count: reportsNotUpdated } = await knex('certification-issue-reports').count('*').whereNull('categoryId');

  if (reportsNotUpdated > 0) {
    logger.info(
      `Nb de certification issue reports non mis à jour : ${reportsNotUpdated.length} / ${certificationIssueReports.length}`
    );
  } else {
    logger.info(`${certificationIssueReports.length} certification issue reports mis à jour`);
  }
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default { main };

async function _updateIssueReportsWithCategoryId(certificationIssueReports, categories) {
  let count = 0;
  await bluebird.mapSeries(certificationIssueReports, async (certificationIssueReport) => {
    const getCategoryId = (lookupName) => categories.find(({ name }) => lookupName === name)?.id;
    const category = certificationIssueReport.subcategory ?? certificationIssueReport.category;
    certificationIssueReport.categoryId = getCategoryId(category);

    await knex('certification-issue-reports').where({ id: certificationIssueReport.id }).update({
      categoryId: certificationIssueReport.categoryId,
      updatedAt: new Date(),
    });
    count++;
    if (count % 1000 === 0) logger.info('Nombre de certification issue report mis à jour : ', count);
  });
}
