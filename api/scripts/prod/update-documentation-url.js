import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';

const URL = {
  AEFE: 'https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8',
  MLF: 'https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8',
  MEDNUM: 'https://view.genial.ly/6048a0d3757f980dc010d6d4',
  SCO: 'https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f',
  AGRICULTURE: 'https://view.genial.ly/5f85a0b87812e90d12b7b593',
  PRIVE_HORS_CONTRAT: 'https://view.genial.ly/602e3786dd02300d9c14ac3f',
  EFENH: 'https://view.genial.ly/63b2a4ae12e4fc0018c73fbf',

  PROMSOC: 'https://crp.education/documentation-pix-orga-eps/',
  SUP_FWB: 'https://crp.education/documentation-pix-orga-es/',

  //LIEN COOL
  PRO: 'https://cloud.pix.fr/s/documentation_pix_orga',
  INTERINDUSTRIES: 'https://cloud.pix.fr/s/opco2i_entreprises',
  INTERNATIONAL: 'https://cloud.pix.fr/s/doc_pix_orga_francophone',
  DOC_ENGLISH: 'https://cloud.pix.fr/s/doc_pix_orga_english',
  AUF: 'https://cloud.pix.fr/s/documentation_auf',
  DIPUTACIO_DE_BARCELONA: 'https://cloud.pix.fr/s/documentacion_en_espanol',
  CPAM: 'https://cloud.pix.fr/s/deploiement_cnam',
  CNAF: 'https://cloud.pix.fr/s/deploiement_cnaf',
  CNAV: 'https://cloud.pix.fr/s/deploiement_cnav',
  ACOSS: 'https://cloud.pix.fr/s/deploiement_urssaf',
  INSTITUT410: 'https://cloud.pix.fr/s/deploiement_institut410',
  UCANSS: 'https://cloud.pix.fr/s/deploiement_ucanss',
  SECTEUR_CHIMIE: 'https://cloud.pix.fr/s/deploiement_branchechimie',
  EDUSERVICES: 'https://cloud.pix.fr/s/deploiement_eduservices',
  PIXTERRITOIRES: 'https://cloud.pix.fr/s/deploiement_pixterritoires',
  EXPE_MADA: 'https://cloud.pix.fr/s/documentation_madagascar',
  PIC: 'https://cloud.pix.fr/s/kit_pix_emploi',
  MISSION_LOCALE: 'https://cloud.pix.fr/s/kit_pix_emploi',
  CAP_EMPLOI: 'https://cloud.pix.fr/s/kit_pix_emploi',
  EPIDE: 'https://cloud.pix.fr/s/kit_pix_emploi',
  E2C: 'https://cloud.pix.fr/s/deploiement_e2c',

  //LIEN PAS COOL
  SUP: 'https://cloud.pix.fr/s/DTTo7Lp7p6Ktceo',
};

const orderedProTag = [
  { tag: 'INTERNATIONAL', url: URL.INTERNATIONAL },
  { tag: 'DOC ENGLISH', url: URL.DOC_ENGLISH },
  { tag: 'PROMSOC', url: URL.PROMSOC },
  { tag: 'AUF', url: URL.AUF },
  { tag: 'MEDNUM', url: URL.MEDNUM },
  { tag: 'EFENH', url: URL.EFENH },
  { tag: 'DIPUTACIO DE BARCELONA', url: URL.DIPUTACIO_DE_BARCELONA },
  { tag: 'PRIVE HORS CONTRAT', url: URL.PRIVE_HORS_CONTRAT },
  { tag: 'PIC', url: URL.PIC },
  { tag: 'MISSION LOCALE', url: URL.MISSION_LOCALE },
  { tag: 'CAP EMPLOI', url: URL.CAP_EMPLOI },
  { tag: 'EPIDE', url: URL.EPIDE },
  { tag: 'E2C', url: URL.E2C },
  { tag: 'CPAM', url: URL.CPAM },
  { tag: 'CNAF', url: URL.CNAF },
  { tag: 'CNAV', url: URL.CNAV },
  { tag: 'ACOSS', url: URL.ACOSS },
  { tag: 'INSTITUT 4.10', url: URL.INSTITUT410 },
  { tag: 'UCANSS', url: URL.UCANSS },
  { tag: 'SECTEUR CHIMIE', url: URL.SECTEUR_CHIMIE },
  { tag: 'EDUSERVICES', url: URL.EDUSERVICES },
  { tag: 'PIXTERRITOIRES', url: URL.PIXTERRITOIRES },
  { tag: 'INTERINDUSTRIES', url: URL.INTERINDUSTRIES },
  { tag: 'EXPE MADA', url: URL.EXPE_MADA },
  { tag: 'SUP-FWB', url: URL.SUP_FWB },
];

async function updateDocumentationUrl() {
  // common cases
  await _updateProOrganizations();

  await _updateSUPOrganizations();

  await _updateSCOOrganizations();

  // SCO Cases
  await _updateAEFEOrganizations();

  await _updateMLFOrganizations();

  await _updateAGRIOrganizations();

  // Ordered Pro Cases
  for await (const proTag of orderedProTag) {
    await _updateURLFromTag(proTag);
  }
}

export { updateDocumentationUrl, URL };

async function _updateProOrganizations() {
  await knex('organizations').where('type', 'PRO').update({ documentationUrl: URL.PRO });
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

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: URL.AGRICULTURE });
}

async function _updateURLFromTag({ tag, url }) {
  const ids = await knex
    .from('organizations')
    .join('organization-tags', 'organizationId', 'organizations.id')
    .join('tags', 'tagId', 'tags.id')
    .where({ 'tags.name': tag })
    .pluck('organizations.id');

  await knex('organizations').whereIn('id', ids).update({ documentationUrl: url });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

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
