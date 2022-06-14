const PIX_SUPER_ADMIN_ID = 199;
const PIX_SUPPORT_ID = 200;
const PIX_METIER_ID = 201;
const PIX_CERTIF_ID = 202;
const DEFAULT_PASSWORD = 'pix123';

function usersBuilder({ databaseBuilder }) {

  const now = new Date('2022-06-10');
  databaseBuilder.factory.buildUser.withRawPassword({
    id: 1,
    firstName: 'Pix',
    lastName: 'Aile',
    email: 'userpix1@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    lang: 'fr',
    createdAt: now,
    mustValidateTermsOfService: false,
    lastTermsOfServiceValidatedAt: now,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: now,
    pixCertifTermsOfServiceAccepted: true,
    lastPixCertifTermsOfServiceValidatedAt: now,
    lastLoggedAt: now,
    emailConfirmedAt: now,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_SUPER_ADMIN_ID,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_SUPPORT_ID,
    firstName: 'Pix',
    lastName: 'Support',
    email: 'pixsupport@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_METIER_ID,
    firstName: 'Pix',
    lastName: 'Métier',
    email: 'pixmetier@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_CERTIF_ID,
    firstName: 'Pix',
    lastName: 'Certif',
    email: 'pixcertif@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: 10,
    firstName: 'Lance',
    lastName: 'Low',
    username: 'lance.low1234',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  const userShouldChangePassword = {
    firstName: 'Joffrey',
    lastName: 'Baratheon',
    email: null,
    username: 'username123',
    rawPassword: 'Password123',
    cgu: false,
    shouldChangePassword: true,
  };
  databaseBuilder.factory.buildUser.withRawPassword(userShouldChangePassword);

  const userWithSamlId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Margaery',
    lastName: 'Tyrell',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: 'samlId',
    userId: userWithSamlId.id,
  });

  const userFromPoleEmploi = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Paul',
    lastName: 'Amplois',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
    userId: userFromPoleEmploi.id,
  });

  const userWithLastTermsOfServiceValidated = {
    firstName: 'lasttermsofservice',
    lastName: 'validated',
    email: 'lasttermsofservice@validated.net',
    rawPassword: 'Password123',
    cgu: true,
    mustValidateTermsOfService: false,
    lastTermsOfServiceValidatedAt: '2020-07-22',
  };
  databaseBuilder.factory.buildUser.withRawPassword(userWithLastTermsOfServiceValidated);

  const userWithLastTermsOfServiceNotValidated = {
    firstName: 'lasttermsofservice',
    lastName: 'notValidated',
    email: 'lasttermsofservice@notvalidated.net',
    rawPassword: 'Password123',
    cgu: true,
    mustValidateTermsOfService: true,
    lastTermsOfServiceValidatedAt: null,
  };
  databaseBuilder.factory.buildUser.withRawPassword(userWithLastTermsOfServiceNotValidated);
}

module.exports = {
  usersBuilder,
  PIX_SUPER_ADMIN_ID,
  PIX_SUPPORT_ID,
  PIX_METIER_ID,
  PIX_CERTIF_ID,
  DEFAULT_PASSWORD,
};
