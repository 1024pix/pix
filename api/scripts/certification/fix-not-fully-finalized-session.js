import 'dotenv/config';

import { usecases } from '../../src/certification/session-management/domain/usecases/index.js';
import * as sessionRepository from '../../src/certification/session-management/infrastructure/repositories/session-repository.js';
import * as certificationReportRepository from '../../src/certification/shared/infrastructure/repositories/certification-report-repository.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';

export class FixNotFullyFinalizedSession extends Script {
  constructor() {
    super({
      description: 'Re-finalize session without finalized-session entry',
      permanent: false,
      options: {
        sessionId: {
          type: 'integer',
          describe: 'Id of the session to be finalized',
          demandOption: true,
          requiresArg: true,
        },
      },
    });
  }

  async handle({
    options,
    logger,
    finalizeSession = usecases.finalizeSession,
    unfinalizeSession = usecases.unfinalizeSession,
    processAutoJury = usecases.processAutoJury,
    registerPublishableSession = usecases.registerPublishableSession,
  } = {}) {
    await DomainTransaction.execute(async () => {
      const { sessionId } = options;
      this.logger = logger;

      this.logger.info(`Updating session ${sessionId}.`);

      await unfinalizeSession({ sessionId });

      const { examinerGlobalComment, hasIncident, hasJoiningIssue } = await sessionRepository.get({ id: sessionId });
      const certificationReports = await certificationReportRepository.findBySessionId({ sessionId });

      const sessionFinalized = await finalizeSession({
        sessionId,
        certificationReports,
        examinerGlobalComment,
        hasIncident,
        hasJoiningIssue,
      });

      const autoJuryDone = await processAutoJury({ sessionFinalized });

      await registerPublishableSession({ autoJuryDone });

      this.logger.info(`${sessionId} finalized`);

      return 0;
    });
  }
}

await ScriptRunner.execute(import.meta.url, FixNotFullyFinalizedSession);
