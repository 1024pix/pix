import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
export class RedirectCampaignsToTunnelScript extends Script {
  constructor() {
    super({
      description: 'Updates campaigns customResultPageButtonUrl to redirect to tunnel page after results',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          default: false,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      try {
        const campaignIds = await knexConn('campaigns')
          .whereRaw('?? ~ ?', ['customResultPageButtonUrl', '^/parcours/[A-Z0-9]+$'])
          .pluck('id');

        await knexConn('campaigns')
          .whereIn('id', campaignIds)
          .update({
            customResultPageButtonUrl: knexConn.raw(`?? || '/checkpoint'`, ['customResultPageButtonUrl']),
          });

        logger.info(
          { event: 'RedirectCampaignsToTunnelScript' },
          `Updates ${campaignIds.length} campaigns customResultPageButtonUrl to redirect to tunnel page after results`,
        );

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK due to dryRun`);
          logger.info(`--dryRun false to persist changes`);
          return;
        }

        logger.info(
          { event: 'RedirectCampaignsToTunnelScript' },
          `COMMIT: Successfully updated relevant campaigns to redirect to tunnel page after results`,
        );
      } catch (error) {
        await knexConn.rollback();
        logger.error({ event: 'RedirectCampaignsToTunnelScript' }, `ROLLBACK: An error has occured, ${error}`);
        throw error;
      }
    });
  }
}
await ScriptRunner.execute(import.meta.url, RedirectCampaignsToTunnelScript);
