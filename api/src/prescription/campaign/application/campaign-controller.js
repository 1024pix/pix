import { usecases } from '../domain/usecases/index.js';
import * as divisionSerializer from '../infrastructure/serializers/jsonapi/division-serializer.js';

const division = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
  return divisionSerializer.serialize(divisions);
};

const campaignController = {
  division,
};

export { campaignController };
