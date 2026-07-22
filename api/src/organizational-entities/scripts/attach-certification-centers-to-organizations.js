import { setTimeout } from 'node:timers/promises';

import Joi from 'joi';
import _ from 'lodash';

import { csvFileParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../shared/infrastructure/utils/knex-utils.js';
import { organizationForAdminRepository } from '../infrastructure/repositories/organization-for-admin.repository.js';

export const csvSchema = [
  {
    name: 'organization_id',
    schema: Joi.number().empty(['', null]).required().messages({ 'any.required': 'organization_id is required' }),
  },
  {
    name: 'certification_center_id',
    schema: Joi.number()
      .empty(['', null])
      .required()
      .messages({ 'any.required': 'certification_center_id is required' }),
  },
];

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 300;

export class AttachCertificationCentersToOrganizationsScript extends Script {
  constructor() {
    super({
      description: 'Attach certification centers to organizations.',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe: 'CSV file path',
          demandOption: true,
          requiresArg: true,
          coerce: csvFileParser(csvSchema),
        },
        batchSize: {
          type: 'number',
          describe: 'Size of the batch of users to process',
          default: DEFAULT_BATCH_SIZE,
        },
        throttleDelay: {
          type: 'number',
          describe: 'Delay between batches in milliseconds',
          default: DEFAULT_THROTTLE_DELAY,
        },
        dryRun: {
          type: 'boolean',
          describe: 'Executes the script in dry run mode',
          default: true,
        },
      },
    });
  }
  async handle({ options, logger }) {
    const { file, batchSize, throttleDelay, dryRun } = options;

    if (dryRun) {
      logger.info('Dry run mode: TRUE. Nothing will be committed to database.');
    }

    logger.info('Checking for duplicates ids...');
    const allOrganizationIds = file.map((item) => item.organization_id);
    const organizationIdsDuplicates = allOrganizationIds.filter(
      (id, index) => allOrganizationIds.indexOf(id) !== index && allOrganizationIds.lastIndexOf(id) === index,
    );

    if (organizationIdsDuplicates.length) {
      throw new Error(
        `Organization ids ${organizationIdsDuplicates.join(', ')} have duplicates. Please ensure all organization ids are unique in the file.`,
      );
    }

    const allCertificationCenterIds = file.map((item) => item.certification_center_id);
    const certificationCenterIdsDuplicates = allCertificationCenterIds.filter(
      (id, index) =>
        allCertificationCenterIds.indexOf(id) !== index && allCertificationCenterIds.lastIndexOf(id) === index,
    );

    if (certificationCenterIdsDuplicates.length) {
      throw new Error(
        `Certification center ids ${certificationCenterIdsDuplicates.join(', ')} have duplicates. Please ensure all certification center ids are unique in the file.`,
      );
    }

    const batches = _.chunk(file, batchSize);

    let batchCount = 1;

    logger.info(`${file.length} rows to process in ${batches.length} batch(es) of ${batchSize}.`);

    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      for (const batch of batches) {
        logger.info(`Batch #${batchCount}/${batches.length} (${batch.length} rows)`);
        batchCount++;

        logger.info('Verifying organizations ids...');
        const organizationIds = batch.map((row) => row.organization_id);
        const certificationCenterIds = batch.map((row) => row.certification_center_id);

        const existingOrganizationIds = await organizationForAdminRepository.findExistingIds({
          ids: organizationIds,
        });

        if (existingOrganizationIds.length !== organizationIds.length) {
          const missingOrganizationIds = organizationIds.filter((id) => !existingOrganizationIds.includes(id));
          throw new Error(`Organizations with ids ${missingOrganizationIds.join(', ')} do not exist.`);
        }

        logger.info('Verifying organization structures...');
        const organizationsWithStructureIds = await knexConn('fct_structures')
          .select('organization_id')
          .whereIn('organization_id', organizationIds)
          .pluck('organization_id');

        if (organizationsWithStructureIds.length !== organizationIds.length) {
          const organizationsWithoutStructureIds = organizationIds.filter(
            (id) => !organizationsWithStructureIds.includes(id),
          );
          throw new Error(
            `Organizations with ids ${organizationsWithoutStructureIds.join(
              ', ',
            )} do not have a structure and cannot be attached to a certification center.`,
          );
        }

        logger.info('Verifying certification centers ids...');
        const existingCertificationCenterIds = await knexConn('certification-centers')
          .select('id')
          .whereIn('id', certificationCenterIds)
          .pluck('id');

        if (existingCertificationCenterIds.length !== certificationCenterIds.length) {
          const missingCertificationCenterIds = certificationCenterIds.filter(
            (id) => !existingCertificationCenterIds.includes(id),
          );
          throw new Error(`Certification centers with ids ${missingCertificationCenterIds.join(', ')} do not exist.`);
        }

        logger.info('Checking if organizations are not already attached...');
        const alreadyAttachedOrganizationsIds = await knexConn('fct_structures')
          .select('organization_id')
          .whereIn('organization_id', organizationIds)
          .whereNotNull('certification_center_id')
          .pluck('organization_id');

        if (alreadyAttachedOrganizationsIds.length) {
          throw new Error(
            `Organizations with ids ${alreadyAttachedOrganizationsIds.join(', ')} already have an attached certification center.`,
          );
        }

        logger.info('Checking if certification centers are not already attached...');
        const alreadyAttachedCertificationCentersIds = await knexConn('fct_structures')
          .select('certification_center_id')
          .whereIn('certification_center_id', certificationCenterIds)
          .whereNotNull('organization_id')
          .pluck('certification_center_id');

        if (alreadyAttachedCertificationCentersIds.length) {
          throw new Error(
            `Certification centers with ids ${alreadyAttachedCertificationCentersIds.join(', ')} already have an attached organization.`,
          );
        }

        logger.info('All checks ok, starting process of attachment...');
        await batchUpdate({
          tableName: 'fct_structures',
          primaryKeyName: 'organization_id',
          rows: batch,
          chunkSize: batchSize,
        });

        await setTimeout(throttleDelay);
      }

      if (dryRun) {
        logger.info(`Dry run mode. ${file.length} organizations to be attached to certification centers.`);
        await knexConn.rollback();
      } else {
        logger.info(`${file.length} organizations attached to certification centers.`);
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, AttachCertificationCentersToOrganizationsScript);
