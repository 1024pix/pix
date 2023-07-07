import { buildOrganizations } from './build-organization.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  buildOrganizations(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
