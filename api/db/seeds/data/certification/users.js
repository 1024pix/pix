const PIX_SCO_CERTIF_USER_ID = 100;
const PIX_PRO_CERTIF_USER_ID = 101;
const PIX_SUP_CERTIF_USER_ID = 102;
const PIX_NONE_CERTIF_USER_ID = 103;
const CERTIF_SUCCESS_USER_ID = 104;
const CERTIF_FAILURE_USER_ID = 105;
const CERTIF_REGULAR_USER1_ID = 106;
const CERTIF_REGULAR_USER2_ID = 107;
const CERTIF_REGULAR_USER3_ID = 108;
const CERTIF_REGULAR_USER4_ID = 109;
const CERTIF_REGULAR_USER5_ID = 110;

function certificationUsersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_SCO_CERTIF_USER_ID,
    firstName: 'SCO',
    lastName: 'Certification',
    email: 'certifsco@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_PRO_CERTIF_USER_ID,
    firstName: 'PRO',
    lastName: 'Certification',
    email: 'certifpro@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_SUP_CERTIF_USER_ID,
    firstName: 'SUP',
    lastName: 'Certification',
    email: 'certifsup@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_NONE_CERTIF_USER_ID,
    firstName: 'NONE',
    lastName: 'Certification',
    email: 'certifnone@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_SUCCESS_USER_ID,
    firstName: 'AnneSuccess',
    lastName: 'Certif',
    email: 'certif-success@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_FAILURE_USER_ID,
    firstName: 'AnneFailure',
    lastName: 'Certif',
    email: 'certif-failure@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_REGULAR_USER1_ID,
    firstName: 'AnneNormale1',
    lastName: 'Certif1',
    email: 'certif1@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_REGULAR_USER2_ID,
    firstName: 'AnneNormale2',
    lastName: 'Certif2',
    email: 'certif2@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_REGULAR_USER3_ID,
    firstName: 'AnneNormale3',
    lastName: 'Certif3',
    email: 'certif3@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_REGULAR_USER4_ID,
    firstName: 'AnneNormale4',
    lastName: 'Certif4',
    email: 'certif4@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: CERTIF_REGULAR_USER5_ID,
    firstName: 'AnneNormale5',
    lastName: 'Certif5',
    email: 'certif5@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });
}

module.exports = {
  certificationUsersBuilder,
  PIX_SCO_CERTIF_USER_ID,
  PIX_PRO_CERTIF_USER_ID,
  PIX_SUP_CERTIF_USER_ID,
  PIX_NONE_CERTIF_USER_ID,
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER1_ID,
  CERTIF_REGULAR_USER2_ID,
  CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID,
  CERTIF_REGULAR_USER5_ID,
};
