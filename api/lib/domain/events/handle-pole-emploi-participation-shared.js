const _ = require('lodash');
const axios = require('axios');
const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');
const PoleEmploiSending = require('../models/PoleEmploiSending');
const { UnexpectedUserAccount } = require('../errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const settings = require('../../config');

const eventType = CampaignParticipationResultsShared;

async function handlePoleEmploiParticipationShared({
  event,
  authenticationMethodRepository,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  organizationRepository,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { campaignParticipationId } = event;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {

    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
    });

    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI });
    if (!_.get(authenticationMethod, 'authenticationComplement.accessToken')) {
      throw new UnexpectedUserAccount({ message: 'Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi', code: 'UNEXPECTED_USER_ACCOUNT', meta: { value: null } });
    }

    const poleEmploiSending = new PoleEmploiSending({
      campaignParticipationId,
      type: PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
      payload: JSON.stringify(payload),
    });

    await axios.post(
      settings.poleEmploi.sendingUrl,
      payload.toString(),
      {
        headers: {
          'Authorization': `Bearer ${authenticationMethod.authenticationComplement.accessToken}`,
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Service-source': 'Pix',
        },
      },
    ).then(
      (response) => poleEmploiSending.succeed(response.status),
      (error) => poleEmploiSending.fail(error.response.status),
    );
    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationShared.eventType = eventType;
module.exports = handlePoleEmploiParticipationShared;
