import { usecases } from '../../domain/usecases/index.js';
import { organizationCreditsLotSerializer } from '../../infrastructure/credits/serializers/jsonapi/organization-credits-lot-serializer.js';

const getOrganizationCreditsLots = async function (request, h, dependencies = { organizationCreditsLotSerializer }) {
  const organizationId = request.params.id;

  const creditsLots = await usecases.getOrganizationCreditsLots({ organizationId });

  return dependencies.organizationCreditsLotSerializer.serialize(creditsLots);
};

const organizationCreditsLotController = { getOrganizationCreditsLots };

export { organizationCreditsLotController };
