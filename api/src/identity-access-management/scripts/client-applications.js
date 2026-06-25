import { clientApplicationRepository } from '../../../src/identity-access-management/infrastructure/repositories/client-application.repository.js';
import { Script } from '../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../src/shared/application/scripts/script-runner.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';

export class ClientApplicationsScript extends Script {
  constructor() {
    super({
      description: 'Manage client applications',
      commands: {
        list: {
          description: 'List client applications',
        },
        add: {
          description: 'Create client application',
          options: {
            name: {
              description: 'Client application name',
              demandOption: true,
              type: 'string',
            },
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            clientSecret: {
              description: 'Client secret',
              demandOption: true,
              type: 'string',
            },
            scope: {
              description: 'Authorized scope (repeatable)',
              demandOption: true,
              type: 'array',
            },
            jurisdiction: {
              description:
                'Jurisdiction definition, currently, only an object like `{ "rules": [{ "name": "tags", "value": ["tag name"] }] }` is supported. \nThe juridiction restricts the data access to organizations tagged with specified "tag name".',
              demandOption: false,
              default: null,
              type: 'object',
            },
          },
        },
        remove: {
          description: 'Remove client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
          },
        },
        addScope: {
          description: 'Add one or more scopes to client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            scope: {
              description: 'Authorized scope (repeatable)',
              demandOption: true,
              type: 'array',
            },
          },
        },
        removeScope: {
          description: 'Remove one or more scopes from client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            scope: {
              description: 'Authorized scope (repeatable)',
              demandOption: true,
              type: 'array',
            },
          },
        },
        setClientSecret: {
          description: 'Set client secret of client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            clientSecret: {
              description: 'Client secret',
              demandOption: true,
              type: 'string',
            },
          },
        },
        addJurisdictionTags: {
          description: 'Add one or more jurisdiction tag to client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            tags: {
              description: 'Jurisdiction tag (repeatable)',
              demandOption: true,
              type: 'array',
            },
          },
        },
        removeJurisdictionTags: {
          description: 'Remove one or more jurisdiction tag from client application',
          options: {
            clientId: {
              description: 'Client ID',
              demandOption: true,
              type: 'string',
            },
            tags: {
              description: 'Jurisdiction tag (repeatable)',
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
    await this[command ?? 'list'](options, logger);
  }

  async list() {
    const list = await clientApplicationRepository.list();
    // eslint-disable-next-line no-console
    console.table(
      list.map((clientApplication) => {
        return {
          ...clientApplication,
          jurisdiction: JSON.stringify(clientApplication.jurisdiction),
        };
      }),
    );
  }

  async add({ name, clientId, clientSecret, scope: scopes, jurisdiction }, logger) {
    const hashedClientSecret = await cryptoService.hashPassword(clientSecret);
    await clientApplicationRepository.create({
      name,
      clientId,
      clientSecret: hashedClientSecret,
      scopes,
      jurisdiction: JSON.parse(jurisdiction),
    });
    logger.info({ clientName: name, clientId, scopes, jurisdiction }, 'client application created');
  }

  async remove({ clientId }, logger) {
    const removed = await clientApplicationRepository.removeByClientId(clientId);
    if (removed) {
      logger.info({ clientId }, 'removed one client applications');
    } else {
      logger.error('did not remove any client applications');
    }
  }

  async addScope({ clientId, scope: newScopes }, logger) {
    const application = await clientApplicationRepository.findByClientId(clientId);
    if (!application) {
      logger.error({ clientId }, 'did not find client application');
      return;
    }

    for (const scope of newScopes) {
      application.addScope(scope);
    }
    await clientApplicationRepository.save(application);

    logger.info({ clientId, scopes: newScopes }, 'added scopes to client application');
  }

  async removeScope({ clientId, scope: scopesToRemove }, logger) {
    const application = await clientApplicationRepository.findByClientId(clientId);
    if (!application) {
      logger.error({ clientId }, 'did not find client application');
      return;
    }

    for (const scope of scopesToRemove) {
      application.removeScope(scope);
    }
    await clientApplicationRepository.save(application);

    logger.info({ clientId, scopes: scopesToRemove }, 'removed scopes from client application');
  }

  async setClientSecret({ clientId, clientSecret }, logger) {
    const hashedClientSecret = await cryptoService.hashPassword(clientSecret);
    const application = await clientApplicationRepository.findByClientId(clientId);
    if (!application) {
      logger.error({ clientId }, 'did not find client application');
      return;
    }
    application.clientSecret = hashedClientSecret;

    await clientApplicationRepository.save(application);

    logger.info({ clientId }, 'set client secret for client application');
  }

  async addJurisdictionTags({ clientId, tags }, logger) {
    const application = await clientApplicationRepository.findByClientId(clientId);
    if (!application) {
      logger.error({ clientId }, 'did not find client application');
      return;
    }

    for (const tag of tags) {
      application.addJurisdictionTag(tag);
    }

    await clientApplicationRepository.save(application);
    logger.info({ clientId, jurisdictionTags: tags }, 'added jurisdiction tags to client application');
  }

  async removeJurisdictionTags({ clientId, tags }, logger) {
    const application = await clientApplicationRepository.findByClientId(clientId);
    if (!application) {
      logger.error({ clientId }, 'did not find client application');
      return;
    }

    for (const tag of tags) {
      try {
        application.removeJurisdictionTag(tag);
      } catch (error) {
        logger.error({ tag, error }, 'error while removing tag for client application');
      }
    }
    await clientApplicationRepository.save(application);
    logger.info({ clientId, jurisdictionTags: tags }, 'removed jurisdiction tags from client application');
  }
}

await ScriptRunner.execute(import.meta.url, ClientApplicationsScript);
