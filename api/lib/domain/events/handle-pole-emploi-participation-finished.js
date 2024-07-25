import { PoleEmploiSending } from '../../../src/shared/domain/models/PoleEmploiSending.js';
import { PoleEmploiPayload } from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as httpErrorsHelper from '../../infrastructure/http/errors-helper.js';
import { httpAgent } from '../../infrastructure/http/http-agent.js';
import * as monitoringTools from '../../infrastructure/monitoring-tools.js';
import { AssessmentCompleted } from './AssessmentCompleted.js';
import { checkEventTypes } from './check-event-types.js';

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
