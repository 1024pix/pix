const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

module.exports = {
  commonBuilder,
};

// IDS
/// USERS
const REAL_PIX_SUPER_ADMIN = 90000;

function commonBuilder({ databaseBuilder }) {
  _createSuperAdmin(databaseBuilder);
  _createTags(databaseBuilder);
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
