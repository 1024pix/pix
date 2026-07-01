import { setTimeout } from 'node:timers/promises';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { LegalDocumentService } from '../domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../domain/models/LegalDocumentType.js';
import * as legalDocumentRepository from '../infrastructure/repositories/legal-document.repository.js';

const { TOS } = LegalDocumentType.VALUES;
const { PIX_APP } = LegalDocumentService.VALUES;

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 300;

export class ConvertUsersPixAppCguData extends Script {
  constructor() {
    super({
      description: 'Converts users pix-app CGU data to legal-document-versions-user-acceptances',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Executes the script in dry run mode',
          default: false,
        },
        batchSize: {
          type: 'number',
          describe: 'Size of the batch to process',
          default: DEFAULT_BATCH_SIZE,
        },
        throttleDelay: {
          type: 'number',
          describe: 'Delay between batches in milliseconds',
          default: DEFAULT_THROTTLE_DELAY,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { dryRun, batchSize, throttleDelay } = options;

    const legalDocument = await legalDocumentRepository.findLastVersionByTypeAndService({
      type: TOS,
      service: PIX_APP,
    });

    if (!legalDocument) {
      throw new Error(`No legal document found for type: ${TOS}, service: ${PIX_APP}`);
    }

    let offset = 0;
    let batchNumber = 0;
    let migrationCount = 0;

    while (true) {
      const usersToMigrate = await this.#findUsersWithoutCguMigration({ legalDocument, batchSize, offset });
      if (usersToMigrate.length === 0) break;

      logger.info(`Batch #${++batchNumber}: ${usersToMigrate.length} users`);

      if (!dryRun) {
        await this.#createNewLegalDocumentAcceptanceForUsersBatch({ legalDocument, users: usersToMigrate });
      } else {
        offset += batchSize;
      }

      migrationCount += usersToMigrate.length;
      await setTimeout(throttleDelay);
    }

    logger.info(`Total users ${dryRun ? 'to migrate' : 'migrated'}: ${migrationCount}`);
  }

  async #findUsersWithoutCguMigration({ legalDocument, batchSize, offset }) {
    const knexConnection = DomainTransaction.getConnection();
    return knexConnection('users')
      .select('users.id', 'users.lastTermsOfServiceValidatedAt')
      .where('users.cgu', true)
      .where('users.hasBeenAnonymised', false)
      .whereNotExists(
        knexConnection
          .select(1)
          .from('legal-document-version-user-acceptances')
          .where('legalDocumentVersionId', legalDocument.id)
          .whereRaw('"legal-document-version-user-acceptances"."userId" = "users"."id"'),
      )
      .limit(batchSize)
      .offset(offset);
  }

  async #createNewLegalDocumentAcceptanceForUsersBatch({ legalDocument, users }) {
    const knexConnection = DomainTransaction.getConnection();

    const chunkSize = 100;
    const rows = users.map((user) => ({
      userId: user.id,
      legalDocumentVersionId: legalDocument.id,
      acceptedAt: user.lastTermsOfServiceValidatedAt || new Date(),
    }));

    await knexConnection.batchInsert('legal-document-version-user-acceptances', rows, chunkSize);
  }
}

await ScriptRunner.execute(import.meta.url, ConvertUsersPixAppCguData);
