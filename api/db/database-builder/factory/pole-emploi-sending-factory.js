import buildCampaignParticipation from './build-campaign-participation';
import buildUser from './build-user';
import buildAuthenticationMethod from './build-authentication-method';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

function build({
  id = databaseBuffer.getNextId(),
  isSuccessful = true,
  responseCode = '200',
  type = 'CAMPAIGN_PARTICIPATION_START',
  payload = { individu: {} },
  createdAt = new Date('2020-01-01'),
  campaignParticipationId,
} = {}) {
  campaignParticipationId = _.isNil(campaignParticipationId)
    ? buildCampaignParticipation().id
    : campaignParticipationId;

  const values = {
    id,
    isSuccessful,
    responseCode,
    type,
    payload,
    createdAt,
    campaignParticipationId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'pole-emploi-sendings',
    values,
  });
}

function buildWithUser(sendingAttributes, externalIdentifier) {
  const { id: userId } = buildUser();
  buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId, externalIdentifier });
  const { id: campaignParticipationId } = buildCampaignParticipation({ userId });
  return build({ ...sendingAttributes, campaignParticipationId });
}

export default {
  build,
  buildWithUser,
};
