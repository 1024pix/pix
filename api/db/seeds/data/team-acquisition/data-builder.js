import { buildCertificationCenterWithStructure } from './build-certification-center-with-structure.js';
import { buildNetworks } from './build-networks.js';

function teamAcquisitionDataBuilder({ databaseBuilder }) {
  buildNetworks(databaseBuilder);
  buildCertificationCenterWithStructure(databaseBuilder);
}

export { teamAcquisitionDataBuilder };
