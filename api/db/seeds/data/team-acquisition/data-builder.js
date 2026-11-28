import { buildCertificationCenterWithStructure } from './build-certification-center-with-structure.js';
import { buildCredits } from './build-credits.js';
import { buildNetworks } from './build-networks.js';

function teamAcquisitionDataBuilder({ databaseBuilder }) {
  buildNetworks(databaseBuilder);
  buildCertificationCenterWithStructure(databaseBuilder);
  buildCredits(databaseBuilder);
}

export { teamAcquisitionDataBuilder };
