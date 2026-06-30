import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import * as competenceRepository from '../../src/shared/infrastructure/repositories/competence-repository.js';

export class AddCompetenceIdsToScoringConfigurations extends Script {
  constructor() {
    super({
      description:
        'This script will add competence ids to jsonb scoring configurations as competence code retrieval is error prone',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun } = options;
    logger.info(`Script execution started`);

    const competenceList = await competenceRepository.listPixCompetencesOnly();
    const competenceIdByIndex = Object.fromEntries(
      competenceList.map((competence) => [competence.index, competence.id]),
    );

    const coreConfigurations = await knex('certification_versions')
      .select('id', 'competencesScoringConfiguration')
      .whereNotNull('competencesScoringConfiguration')
      .whereRaw('"competencesScoringConfiguration"::text != \'null\'');

    let updatedConfigurationsCount = 0;
    for (const configuration of coreConfigurations) {
      const competencesScoringConfiguration = configuration.competencesScoringConfiguration;

      const updatedConfig = competencesScoringConfiguration.map((entry) => {
        const competenceId = competenceIdByIndex[entry.competence];
        if (!competenceId) {
          logger.warn(
            `No competence found for index "${entry.competence}" in certification_version ${configuration.id}`,
          );
          return entry;
        }
        return { ...entry, competenceId };
      });

      if (!dryRun) {
        const knexConnection = DomainTransaction.getConnection();
        await knexConnection('certification_versions')
          .where('id', configuration.id)
          .update({
            competencesScoringConfiguration: JSON.stringify(updatedConfig),
          });
      }
      updatedConfigurationsCount++;
    }

    logger.info(
      `${updatedConfigurationsCount} certification_versions rows processed ${dryRun ? '(dry run)' : ''}. Youpi Yo Youpi Yay`,
    );
  }
}

await ScriptRunner.execute(import.meta.url, AddCompetenceIdsToScoringConfigurations);
