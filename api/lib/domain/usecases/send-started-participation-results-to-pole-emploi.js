import { PoleEmploiSending } from '../../../src/shared/domain/models/PoleEmploiSending.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as httpErrorsHelper from '../../infrastructure/http/errors-helper.js';
import { httpAgent } from '../../infrastructure/http/http-agent.js';

const sendStartedParticipationResultsToPoleEmploi = async ({
  campaignParticipationId,
  authenticationMethodRepository,
  campaignParticipationRepository,
  campaignRepository,
  organizationRepository,
  poleEmploiNotifier,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
  notifierDependencies = {
    httpAgent,
    httpErrorsHelper,
    logger,
  },
}) => {
  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);

    const payload = PoleEmploiPayload.buildForParticipationStarted({
      user,
      campaign,
      targetProfile,
      participation,
    });

    const response = await poleEmploiNotifier.notify(user.id, payload, {
      authenticationMethodRepository: authenticationMethodRepository,
      ...notifierDependencies,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    await poleEmploiSendingRepository.create({ poleEmploiSending });
  }
};

export { sendStartedParticipationResultsToPoleEmploi };
