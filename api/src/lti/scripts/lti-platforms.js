import { Script } from '../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../src/shared/application/scripts/script-runner.js';
import { getOrganization } from '../../organizational-entities/application/api/organization-api.js';
import { LtiPlatformRegistration } from '../domain/models/LtiPlatformRegistration.js';
import { ltiPlatformRepository } from '../infrastructure/repositories/lti-platform.repository.js';
import { ltiPlatformRegistrationRepository } from '../infrastructure/repositories/lti-platform-registration.repository.js';

/**
 * @typedef {{
 *   console: typeof console
 *   logger: import('pino').Logger
 * }} CommandDependencies
 */

export class LtiPlatformsScript extends Script {
  constructor() {
    super({
      description: 'Manage LTI platforms',
      commands: {
        list: {
          description: 'List authorized LTI platforms',
        },
        add: {
          description: 'Authorizes a new LTI platform',
          options: {
            issuer: {
              description: 'LTI platform’s issuer',
              demandOption: true,
              type: 'string',
            },
          },
        },
        registrations: {
          description: 'Lists registrations for a platform',
          options: {
            platformId: {
              description: 'LTI platform’s ID',
              demandOption: true,
              type: 'integer',
            },
          },
        },
        'set-registration-status': {
          description: 'Sets registration status',
          options: {
            clientId: {
              description: 'LTI platform registration’s client ID',
              demandOption: true,
              type: 'string',
            },
            status: {
              description: 'New status',
              demandOption: true,
              type: 'string',
              choices: Object.values(LtiPlatformRegistration.status),
            },
          },
        },
        organizations: {
          description: 'Lists organizations for a platform',
          options: {
            platformId: {
              description: 'LTI platform’s ID',
              demandOption: true,
              type: 'integer',
            },
          },
        },
        'add-organizations': {
          description: 'Adds organizations to a platform',
          options: {
            platformId: {
              description: 'LTI platform’s ID',
              demandOption: true,
              type: 'integer',
            },
            organizationId: {
              description: 'Organization’s ID',
              demandOption: true,
              type: 'array',
            },
          },
        },
      },
      permanent: true,
    });
  }

  async handle({ command, options, logger }) {
    if (!command) throw new Error('invalid command');
    await this[command](options, { console, logger });
  }

  /**
   * @param {object} _options
   * @param {CommandDependencies} dependencies
   */
  async list(_options, { console }) {
    const platforms = await ltiPlatformRepository.findAll();

    console.table(platforms);
  }

  /**
   * @param {object} options
   * @param {string} options.issuer
   * @param {CommandDependencies} dependencies
   */
  async add({ issuer }, { logger }) {
    const createdPlatform = await ltiPlatformRepository.create({ issuer });

    logger.info(`LTI platform created with id ${createdPlatform.id} and issuer "${createdPlatform.issuer}"`);
  }

  /**
   * @param {object} options
   * @param {string} options.platformId
   * @param {CommandDependencies} dependencies
   */
  async registrations({ platformId }, { console }) {
    const registrations = await ltiPlatformRegistrationRepository.findAllByPlatformId({ platformId });

    console.table(registrations.map(({ clientId, status }) => ({ clientId, status })));
  }

  /**
   * @param {object} options
   * @param {string} options.clientId
   * @param {string} options.status
   * @param {CommandDependencies} dependencies
   */
  async 'set-registration-status'({ clientId, status }, { logger }) {
    const registration = await ltiPlatformRegistrationRepository.findByClientId(clientId);

    registration.status = status;

    await ltiPlatformRegistrationRepository.update(registration);

    logger.info(`LTI platform registration clientId=${clientId} updated with status=${status}`);
  }

  /**
   * @param {object} options
   * @param {string} options.platformId
   * @param {CommandDependencies} dependencies
   */
  async organizations({ platformId }, { console }) {
    const { organizationIds } = await ltiPlatformRepository.get(platformId);

    const organizations = [];
    for (const organizationId of organizationIds) {
      organizations.push(await getOrganization(organizationId));
    }

    console.table(organizations.map(({ id, name }) => ({ id, name })));
  }

  /**
   * @param {object} options
   * @param {string} options.platformId
   * @param {string[]} options.organizationId
   * @param {CommandDependencies} dependencies
   */
  async 'add-organizations'({ platformId, organizationId: organizationIds }, { logger }) {
    const insertedCount = await ltiPlatformRepository.addOrganizations({ platformId, organizationIds });

    logger.info(`Added ${insertedCount} organizations to LTI platform platformId=${platformId}`);
  }
}

await ScriptRunner.execute(import.meta.url, LtiPlatformsScript);
