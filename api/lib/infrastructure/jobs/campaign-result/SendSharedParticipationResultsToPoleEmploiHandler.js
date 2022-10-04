const PoleEmploiPayload = require('../../externals/pole-emploi/PoleEmploiPayload');
const PoleEmploiSending = require('../../../domain/models/PoleEmploiSending');

class SendSharedParticipationResultsToPoleEmploiHandler {
  constructor({
    campaignRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    organizationRepository,
    poleEmploiSendingRepository,
    targetProfileRepository,
    userRepository,
    poleEmploiNotifier,
  }) {
    this.campaignRepository = campaignRepository;
    this.campaignParticipationRepository = campaignParticipationRepository;
    this.campaignParticipationResultRepository = campaignParticipationResultRepository;
    this.organizationRepository = organizationRepository;
    this.poleEmploiSendingRepository = poleEmploiSendingRepository;
    this.targetProfileRepository = targetProfileRepository;
    this.userRepository = userRepository;
    this.poleEmploiNotifier = poleEmploiNotifier;
  }

  async handle(event) {
    const { campaignParticipationId } = event;

    const participation = await this.campaignParticipationRepository.get(campaignParticipationId);
    const campaign = await this.campaignRepository.get(participation.campaignId);
    const organization = await this.organizationRepository.get(campaign.organizationId);

    if (campaign.isAssessment() && organization.isPoleEmploi) {
      const user = await this.userRepository.get(participation.userId);
      const targetProfile = await this.targetProfileRepository.get(campaign.targetProfileId);
      const participationResult = await this.campaignParticipationResultRepository.getByParticipationId(
        campaignParticipationId
      );

      const payload = PoleEmploiPayload.buildForParticipationShared({
        user,
        campaign,
        targetProfile,
        participation,
        participationResult,
      });

      const response = await this.poleEmploiNotifier.notify(user.id, payload.toString());

      const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
        campaignParticipationId,
        payload: payload.toString(),
        isSuccessful: response.isSuccessful,
        responseCode: response.code,
      });

      return this.poleEmploiSendingRepository.create({ poleEmploiSending });
    }
  }

  get name() {
    return 'SendSharedParticipationResultsToPoleEmploi';
  }
}

module.exports = SendSharedParticipationResultsToPoleEmploiHandler;
