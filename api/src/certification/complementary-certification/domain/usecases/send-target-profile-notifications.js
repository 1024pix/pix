import bluebird from 'bluebird';

import {
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
} from '../../../../../lib/infrastructure/monitoring-tools.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
const EVENT_NAME = 'attach-target-profile-certif';

export { sendTargetProfileNotifications };

async function sendTargetProfileNotifications({
  targetProfileIdToDetach,
  complementaryCertification,
  organizationRepository,
  mailService,
}) {
  const complementaryCertificationName = complementaryCertification.label;
  const emails =
    await organizationRepository.getOrganizationUserEmailByCampaignTargetProfileId(targetProfileIdToDetach);

  if (emails.length) {
    let sucessCounter = 0;
    await bluebird.map(
      emails,
      async (email) => {
        const result = await mailService.sendNotificationToOrganizationMembersForTargetProfileDetached({
          complementaryCertificationName,
          email,
        });
        if (result.hasFailed()) {
          logErrorWithCorrelationIds({
            event: EVENT_NAME,
            message: `Failed to send email to notify organisation user "${email}" of ${complementaryCertificationName}'s target profile change`,
          });

          return;
        }
        sucessCounter++;
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
    );

    logInfoWithCorrelationIds({
      event: EVENT_NAME,
      message: `${sucessCounter} email(s) sent to notify organisation users of ${complementaryCertificationName}'s target profile change`,
    });
  }
}
