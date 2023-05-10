const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

// IDS
/// USERS
const CLEA_COMPLEMENTARY_CERTIFICATION_ID = 52;
const PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID = 53;
const PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 54;
const PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID = 55;
const REAL_PIX_SUPER_ADMIN = 90000;

module.exports = {
  commonBuilder,
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
};
function commonBuilder({ databaseBuilder }) {
  _createSuperAdmin(databaseBuilder);
  _createTags(databaseBuilder);
  _createComplementaryCertifications(databaseBuilder);
}

function _createSuperAdmin(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    id: REAL_PIX_SUPER_ADMIN,
    firstName: 'NextSuper',
    lastName: 'NextAdmin',
    email: 'nextsuperadmin@example.net',
    rawPassword: 'pix123',
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: REAL_PIX_SUPER_ADMIN, role: ROLES.SUPER_ADMIN });
}

function _createTags(databaseBuilder) {
  databaseBuilder.factory.buildTag({ id: 1, name: 'AGRICULTURE' });
  databaseBuilder.factory.buildTag({ id: 2, name: 'PUBLIC' });
  databaseBuilder.factory.buildTag({ id: 3, name: 'PRIVE' });
  databaseBuilder.factory.buildTag({ id: 4, name: 'POLE EMPLOI' });
  databaseBuilder.factory.buildTag({ id: 5, name: 'CFA' });
  databaseBuilder.factory.buildTag({ id: 6, name: 'AEFE' });
  databaseBuilder.factory.buildTag({ id: 7, name: 'MEDNUM' });
  databaseBuilder.factory.buildTag({ id: 8, name: 'COLLEGE' });
  databaseBuilder.factory.buildTag({ id: 9, name: 'LYCEE' });
}

function _createComplementaryCertifications(databaseBuilder) {
  databaseBuilder.factory.buildComplementaryCertification.clea({
    id: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Droit',
    key: 'DROIT',
    id: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 75,
    minimumEarnedPix: null,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Édu 2nd degré',
    key: 'EDU_2ND_DEGRE',
    id: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 70,
    minimumEarnedPix: null,
    hasExternalJury: true,
  });

  databaseBuilder.factory.buildComplementaryCertification({
    label: 'Pix+ Édu 1er degré',
    key: 'EDU_1ER_DEGRE',
    id: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    minimumReproducibilityRate: 70,
    minimumEarnedPix: null,
    hasExternalJury: true,
  });
}
