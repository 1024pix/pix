const PIX_CERTIF_USER_ID = 100;
const CERTIF_SUCCESS_USER_ID = 101;
const CERTIF_FAILURE_USER_ID = 102;

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
}

module.exports = {
  certificationUsersBuilder,
  PIX_CERTIF_USER_ID,
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
};
