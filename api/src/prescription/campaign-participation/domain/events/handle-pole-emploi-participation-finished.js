import { AssessmentCompleted } from '../../../../../lib/domain/events/AssessmentCompleted.js';
import { checkEventTypes } from '../../../../../lib/domain/events/check-event-types.js';
import * as httpErrorsHelper from '../../../../../lib/infrastructure/http/errors-helper.js';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';
import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/PoleEmploiPayload.js';
import { PoleEmploiSending } from '../models/PoleEmploiSending.js';

const eventTypes = [AssessmentCompleted];

async function handlePoleEmploiParticipationFinished({
  event,
  authenticationMethodRepository,
  assessmentRepository,
  campaignRepository,
  campaignParticipationRepository,
  organizationRepository,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
  poleEmploiNotifier,
}) {
  checkEventTypes(event, eventTypes);

  const { campaignParticipationId } = event;

  if (!campaignParticipationId) return;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const assessment = await assessmentRepository.get(participation.lastAssessment.id);

    const payload = PoleEmploiPayload.buildForParticipationFinished({
      user,
      campaign,
      targetProfile,
      participation,
      assessment,
    });
    const response = await poleEmploiNotifier.notify(user.id, payload, {
      authenticationMethodRepository,
      httpAgent,
      httpErrorsHelper,
      monitoringTools,
    });

    const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationFinished.eventTypes = eventTypes;
export { handlePoleEmploiParticipationFinished };
