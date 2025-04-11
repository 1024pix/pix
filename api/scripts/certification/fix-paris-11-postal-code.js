import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

export class FixParis11PostalCode extends Script {
  constructor() {
    super({
      description: 'Fix Paris 11th arrondissement postal code in certification-cpf-cities table',
      permanent: false,
      options: {},
    });
  }
  async handle({ logger }) {
    this.logger = logger;

    await knex('certification-cpf-cities').where({ postalCode: '750011' }).update({ postalCode: '75011' });

    this.logger.info('Paris 11 postal code updated');

    return 0;
  }
}

await ScriptRunner.execute(import.meta.url, FixParis11PostalCode);
