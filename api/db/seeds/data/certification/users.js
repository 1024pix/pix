const PIX_CERTIF_USER_ID = 100;

function certificationUsersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_CERTIF_USER_ID,
    firstName: 'Chef',
    lastName: 'Certification',
    email: 'certif@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });
}

module.exports = {
  certificationUsersBuilder,
  PIX_CERTIF_USER_ID,
};
