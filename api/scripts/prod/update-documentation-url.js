import { knex, disconnect } from '../../db/knex-database-connection.js';

async function updateDocumentationUrl() {
  await _updateProOrganizations();

  await _updateMedNumOrganizations();

  await _updateSUPOrganizations();

  await _updateSCOOrganizations();

  await _updateAEFEOrganizations();

  await _updateMLFOrganizations();

  await _updateAGRIOrganizations();

  await _updateCPAMOrganizations();

  await _updateCNAFOrganizations();

  await _updateCNAVOrganizations();

  await _updateACOSSOrganizations();

  await _updateINSTITUT410Organizations();

  await _updateUCANSSOrganizations();

  await _updateSECTEUR_CHIMIEOrganizations();

  await _updateEDUSERVICESOrganizations();

  await _updatePIXTERRITOIRESOrganizations();
}

const URL = {
  PRO: 'https://cloud.pix.fr/s/cwZN2GAbqSPGnw4',
  SUP: 'https://cloud.pix.fr/s/DTTo7Lp7p6Ktceo',
  AEFE: 'https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8',
  MLF: 'https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8',
  MEDNUM: 'https://view.genial.ly/6048a0d3757f980dc010d6d4',
  SCO: 'https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f',
  AGRI: 'https://view.genial.ly/5f85a0b87812e90d12b7b593',
  CPAM: 'https://cloud.pix.fr/s/deploiement_cnam',
  CNAF: 'https://cloud.pix.fr/s/deploiement_cnaf',
  CNAV: 'https://cloud.pix.fr/s/deploiement_cnav',
  ACOSS: 'https://cloud.pix.fr/s/deploiement_urssaf',
  INSTITUT410: 'https://cloud.pix.fr/s/deploiement_institut410',
  UCANSS: 'https://cloud.pix.fr/s/deploiement_ucanss',
  SECTEUR_CHIMIE: 'https://cloud.pix.fr/s/deploiement_branchechimie',
  EDUSERVICES: 'https://cloud.pix.fr/s/deploiement_eduservices',
  PIXTERRITOIRES: 'https://cloud.pix.fr/s/deploiement_pixterritoires',
};

export { updateDocumentationUrl, URL };

async function _updateProOrganizations() {
  await knex('organizations').where('type', 'PRO').update({ documentationUrl: URL.PRO });
}

async function _updateCPAMOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'CPAM' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.CPAM });
}

async function _updateCNAFOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'CNAF' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.CNAF });
}

async function _updateCNAVOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'CNAV' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.CNAV });
}

async function _updateACOSSOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'ACOSS' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.ACOSS });
}

async function _updateINSTITUT410Organizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'INSTITUT 4.10' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.INSTITUT410 });
}

async function _updateUCANSSOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'UCANSS' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.UCANSS });
}

async function _updateSECTEUR_CHIMIEOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'SECTEUR CHIMIE' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.SECTEUR_CHIMIE });
}

async function _updateEDUSERVICESOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'EDUSERVICES' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.EDUSERVICES });
}

async function _updatePIXTERRITOIRESOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'PIXTERRITOIRES' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.PIXTERRITOIRES });
}

async function _updateMedNumOrganizations() {
  const ids = await knex
    .select('organizations.id')
    .from('organizations')
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ type: 'PRO', 'tags.name': 'MEDNUM' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.MEDNUM });
}

async function _updateSUPOrganizations() {
  await knex('organizations').where('type', 'SUP').update({ documentationUrl: URL.SUP });
}

async function _updateSCOOrganizations() {
  const ids = await knex
    .from('organizations')
    .where({ type: 'SCO', isManagingStudents: true })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.SCO });
}

async function _updateAEFEOrganizations() {
  const ids = await knex
    .from('organizations')
    .where({ type: 'SCO' })
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ 'tags.name': 'AEFE' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.AEFE });
}

async function _updateMLFOrganizations() {
  const ids = await knex
    .from('organizations')
    .where({ type: 'SCO' })
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ 'tags.name': 'MLF' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.MLF });
}

async function _updateAGRIOrganizations() {
  const ids = await knex
    .from('organizations')
    .where({ type: 'SCO', isManagingStudents: true })
    .leftJoin('organization-tags', 'organizationId', 'organizations.id')
    .leftJoin('tags', 'tagId', 'tags.id')
    .where({ 'tags.name': 'AGRICULTURE' })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.AGRI });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  await updateDocumentationUrl();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
