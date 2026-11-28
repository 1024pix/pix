import {
  PRO_MANAGING_ORGANIZATION_ID,
  PRO_MANAGING_STRUCTURE_ID,
  REAL_PIX_SUPER_ADMIN_ID,
} from '../common/constants.js';

export function buildCredits(databaseBuilder) {
  const activeLotId = databaseBuilder.factory.buildCreditsLot({
    structureId: PRO_MANAGING_STRUCTURE_ID,
    count: 10,
    reference: 'CREDITS-ACTIVE',
    activationDate: new Date('2026-01-01'),
    expirationDate: new Date('2099-12-31'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2026-01-01'),
  }).id;
  const expiredLotId = databaseBuilder.factory.buildCreditsLot({
    structureId: PRO_MANAGING_STRUCTURE_ID,
    count: 5,
    reference: 'CREDITS-EXPIRED',
    activationDate: new Date('2024-01-01'),
    expirationDate: new Date('2025-01-01'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2024-01-01'),
  }).id;
  databaseBuilder.factory.buildCreditsLot({
    structureId: PRO_MANAGING_STRUCTURE_ID,
    count: 20,
    reference: 'CREDITS-PENDING',
    activationDate: new Date('2099-01-01'),
    expirationDate: new Date('2099-12-31'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2026-01-01'),
  });

  _buildConsumption(databaseBuilder, {
    creditsLotId: activeLotId,
    learner: { firstName: 'Lucie', lastName: 'Fer' },
    consumedAt: new Date('2026-02-01'),
  });
  _buildConsumption(databaseBuilder, {
    creditsLotId: activeLotId,
    learner: { firstName: 'Paul', lastName: 'Ochon' },
    consumedAt: new Date('2026-03-01'),
  });
  _buildConsumption(databaseBuilder, {
    creditsLotId: expiredLotId,
    learner: { firstName: 'Marc', lastName: 'Assin', deletedAt: new Date('2024-06-01') },
    consumedAt: new Date('2024-02-01'),
  });
}

function _buildConsumption(databaseBuilder, { creditsLotId, learner, consumedAt }) {
  const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
    ...learner,
    organizationId: PRO_MANAGING_ORGANIZATION_ID,
  }).id;
  databaseBuilder.factory.buildCreditsConsumption({ creditsLotId, organizationLearnerId, consumedAt });
}
