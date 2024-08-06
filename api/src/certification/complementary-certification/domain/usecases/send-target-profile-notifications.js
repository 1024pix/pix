import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
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
    await PromiseUtils.map(
      emails,
      async (email) => {
        const result = await mailService.sendNotificationToOrganizationMembersForTargetProfileDetached({
          complementaryCertificationName,
          email,
        });
        if (result.hasFailed()) {
          logger.error({
            event: EVENT_NAME,
            message: `Failed to send email to notify organisation user "${email}" of ${complementaryCertificationName}'s target profile change`,
          });

          return;
        }
        sucessCounter++;
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
    );

    logger.info({
      event: EVENT_NAME,
      message: `${sucessCounter} email(s) sent to notify organisation users of ${complementaryCertificationName}'s target profile change`,
    });
  }
}
