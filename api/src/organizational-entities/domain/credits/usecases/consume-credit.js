import { ORGANIZATION_FEATURE } from '../../../../shared/constants.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NoCreditAvailableError } from '../../errors.js';
import { ActiveCredits } from '../models/ActiveCredits.js';

const consumeCredit = withTransaction(async function ({
  organizationLearnerId,
  organizationId,
  organizationFeatureRepository,
  creditsLotRepository,
  creditsConsumptionRepository,
}) {
  const features = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
    organizationId,
  });
  const hasCreditsManagement = features.some(({ name }) => name === ORGANIZATION_FEATURE.CREDITS_MANAGEMENT.key);

  if (!hasCreditsManagement) return;

  const creditsFromOrganization = await creditsLotRepository.findByOrganizationIdForUpdate({ organizationId });

  const activeCredits = new ActiveCredits(creditsFromOrganization);

  const alreadyHasCredit = await creditsConsumptionRepository.hasConsumptionOnLots({
    organizationLearnerId,
    creditsLotIds: activeCredits.lotIds,
  });

  if (alreadyHasCredit) return;

  const lotToCharge = activeCredits.lotToCharge;

  if (!lotToCharge) {
    throw new NoCreditAvailableError({ meta: { organizationId, organizationLearnerId } });
  }

  await creditsConsumptionRepository.save({ organizationLearnerId, creditsLotId: lotToCharge.id });
});

export { consumeCredit };
