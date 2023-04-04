import { logger } from '../../lib/infrastructure/logger.js';
import { knex, disconnect } from '../../db/knex-database-connection.js';
import bluebird from 'bluebird';
import * as url from 'url';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

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

export { main };

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
