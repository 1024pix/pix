import { usecases } from '../../domain/usecases/index.js';
import { creditsLotSerializer } from '../../infrastructure/credits/serializers/jsonapi/credits-lot-serializer.js';

const create = async function (request, h, dependencies = { creditsLotSerializer }) {
  const { organizationId } = request.params;
  const createdBy = request.auth.credentials.userId;

  const attributes = await dependencies.creditsLotSerializer.deserialize(request.payload);

  const id = await usecases.createCreditsLot({ organizationId, creditsLot: { ...attributes, createdBy } });

  return h.response(dependencies.creditsLotSerializer.serialize({ id })).created();
};

const findOrganizationCreditsLot = async function (request, h, dependencies = { creditsLotSerializer }) {
  const organizationId = request.params.organizationId;

  const organizationCreditsLot = await usecases.findOrganizationCreditsLot({ organizationId });
  return dependencies.creditsLotSerializer.serialize(organizationCreditsLot);
};

const creditsLotController = { create, findOrganizationCreditsLot };

export { creditsLotController };
