import { checkEventTypes } from './check-event-types';
import CampaignParticipationStarted from './CampaignParticipationStarted';
import PoleEmploiPayload from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload';
import PoleEmploiSending from '../models/PoleEmploiSending';

const eventTypes = [CampaignParticipationStarted];

async function handlePoleEmploiParticipationStarted({
  event,
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

    const response = await poleEmploiNotifier.notify(user.id, payload);

    const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationStarted.eventTypes = eventTypes;
export default handlePoleEmploiParticipationStarted;
