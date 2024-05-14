import { usecases } from '../domain/usecases/index.js';
import * as divisionSerializer from '../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../infrastructure/serializers/jsonapi/group-serializer.js';

const division = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
  return divisionSerializer.serialize(divisions);
};

const getGroups = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const groups = await usecases.getParticipantsGroup({ userId, campaignId });
  return groupSerializer.serialize(groups);
};

const campaignController = {
  division,
  getGroups,
};

export { campaignController };
