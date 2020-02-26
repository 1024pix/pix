const PIX_CERTIF_USER_ID = 100;
const CERTIF_SUCCESS_USER_ID = 101;
const CERTIF_FAILURE_USER_ID = 102;
const CERTIF_REGULAR_USER1_ID = 103;
const CERTIF_REGULAR_USER2_ID = 104;
const CERTIF_REGULAR_USER3_ID = 105;
const CERTIF_REGULAR_USER4_ID = 106;
const CERTIF_REGULAR_USER5_ID = 107;

function certificationUsersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_CERTIF_USER_ID,
    firstName: 'Chef',
    lastName: 'Certification',
    email: 'certif@example.net',
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
  PIX_CERTIF_USER_ID,
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER1_ID,
  CERTIF_REGULAR_USER2_ID,
  CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID,
  CERTIF_REGULAR_USER5_ID,
};
