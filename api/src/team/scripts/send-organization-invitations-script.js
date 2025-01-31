import { setTimeout } from 'node:timers/promises';

import Joi from 'joi';
import _ from 'lodash';

import { csvFileParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { OrganizationInvitation } from '../domain/models/OrganizationInvitation.js';
import { usecases } from '../domain/usecases/index.js';

const DEFAULT_BATCH_SIZE = 200;
const DEFAULT_THROTTE_DELAY = 1000;

const columnsSchemas = [
  { name: 'Organization ID', schema: Joi.number() },
  { name: 'email', schema: Joi.string().trim().replace(' ', '').lowercase() },
  { name: 'locale', schema: Joi.string().trim().lowercase() },
  {
    name: 'role',
    schema: Joi.string()
      .trim()
      .optional()
      .valid(...Object.values(OrganizationInvitation.RoleType)),
  },
];

export class SendOrganizationInvitationsScript extends Script {
  constructor() {
    super({
      description: 'this script used to send invitations for one organization with a csv file',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Just to check, not action',
          default: false,
        },
        file: {
          type: 'string',
          describe: 'The file path',
          demandOption: true,
          coerce: csvFileParser(columnsSchemas),
        },
        batchSize: {
          type: 'number',
          describe: 'The batch size',
          default: DEFAULT_BATCH_SIZE,
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: DEFAULT_THROTTE_DELAY,
        },
      },
    });
  }

  async handle({ options, logger, sendOrganizationInvitation = usecases.createOrganizationInvitationByAdmin }) {
    const { file, dryRun, batchSize, throttleDelay } = options;
    const batches = _.chunk(file, batchSize);
    let batchCount = 1;
    for (const batch of batches) {
      logger.info(`Batch #${batchCount++}`);
      batch.map(async (invitation) => {
        if (!dryRun) {
          await sendOrganizationInvitation({
            organizationId: invitation['Organization ID'],
            email: invitation.email,
            locale: invitation.locale,
            role: invitation.role || null,
          });
        }
      });
      await setTimeout(throttleDelay);
      if (dryRun) {
        logger.info('Dry run, no action');
      }
    }
  }
}

await ScriptRunner.execute(import.meta.url, SendOrganizationInvitationsScript);
