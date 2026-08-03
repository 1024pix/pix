import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { PixPlusDroitV3Seed } from './cases/pix-plus-droit-v3.js';
import { PixPlusEdu2ndDegreV3Seed } from './cases/pix-plus-edu-2nd-degre-v3.js';
import { CleaV3Seed } from './cases/simple-CLEA-v3.js';
import { PixPlusDroitV2Seed } from './cases/simple-pix-plus-droit-v2.js';
import { ProSeed } from './cases/simple-pro-certification.js';
import { ScoManagingStudent } from './cases/simple-sco-managing-students-certification.js';
import { SupWithHabilitationsSeed } from './cases/sup-certification-centre-with-habilitations.js';
import { setupConfigurations } from './shared/setup-configuration.js';
import { UnseedableError } from './shared/UnseedableError.js';

export async function teamCertificationDataBuilder({ databaseBuilder, datawarehouseKnex }) {
  try {
    // Pix platform configuration
    await setupConfigurations({ databaseBuilder });

    // Cases
    await new SupWithHabilitationsSeed({ databaseBuilder, datawarehouseKnex }).create();
    await new ProSeed({ databaseBuilder, datawarehouseKnex }).create();
    await new ScoManagingStudent({ databaseBuilder, datawarehouseKnex }).create();
    await new CleaV3Seed({ databaseBuilder, datawarehouseKnex }).create();
    await new PixPlusDroitV2Seed({ databaseBuilder, datawarehouseKnex }).create();
    await new PixPlusDroitV3Seed({ databaseBuilder, datawarehouseKnex }).create();
    await new PixPlusEdu2ndDegreV3Seed({ databaseBuilder, datawarehouseKnex }).create();
  } catch (error) {
    if (error instanceof UnseedableError) {
      logger.warn(error, 'Certification seeding is only minimal/partial');
    } else {
      throw error;
    }
  }
}
