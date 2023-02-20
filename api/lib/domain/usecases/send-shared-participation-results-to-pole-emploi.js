import PoleEmploiPayload from '../../infrastructure/externals/pole-emploi/PoleEmploiPayload';
import PoleEmploiSending from '../models/PoleEmploiSending';

export default async function sendSharedParticipationResultsToPoleEmploi({
  campaignParticipationId,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignRepository,
  organizationRepository,
  poleEmploiNotifier,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
}) {
  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(
      campaignParticipationId
    );

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
    });

    const response = await poleEmploiNotifier.notify(user.id, payload);

    const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}
