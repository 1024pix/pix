import { exit } from 'node:process';

import { usecases } from '../../quest/domain/usecases/index.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

export const PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS = [3652, 3739, 3740, 3923, 3924, 3925];

const options = {
  userId: {
    type: 'string',
    describe: "ID de l'utilisateur",
    demandOption: true,
    requiresArg: true,
  },
};

/**
 * Script to reward sixth-grade students who have already completed a campaign linked to a specific target profile.
 */
export class SixthGradeAttestationRewardScript extends Script {
  constructor() {
    super({
      description: 'This script process attestations rewards for one user',
      permanent: true,
      options,
    });
  }

  async handle({ options, logger, rewardUser = usecases.rewardUser }) {
    logger.info(`Processing user ${options.userId}`);
    try {
      await rewardUser({
        userId: options.userId,
      });
    } catch (err) {
      logger.error(`Error processing user ${options.userId}: `, err);
    }
  }

  /**
   * Called when the script has finished.
   */
  onFinished() {
    exit();
  }
}

await ScriptRunner.execute(import.meta.url, SixthGradeAttestationRewardScript);
