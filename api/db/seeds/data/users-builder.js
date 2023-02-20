import OidcIdentityProviders from '../../../lib/domain/constants/oidc-identity-providers';

const PIX_SUPER_ADMIN_ID = 199;
const PIX_SUPPORT_ID = 200;
const PIX_METIER_ID = 201;
const PIX_CERTIF_ID = 202;
const PIX_ALL_ORGA_ID = 203;
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
    id: PIX_ALL_ORGA_ID,
    firstName: 'All',
    lastName: 'Orga',
    email: 'allorga@example.net',
    pixOrgaTermsOfServiceAccepted: true,
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

  const pixUserWithGarAuthenticationMethod = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Margaery',
    lastName: 'Tyrell',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: 'samlId',
    userId: pixUserWithGarAuthenticationMethod.id,
  });

  const userWithGarAuthenticationMethod = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Mariamu',
    lastName: 'Tatenda',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: `${userWithGarAuthenticationMethod.firstName}.${userWithGarAuthenticationMethod.lastName}`,
    userId: userWithGarAuthenticationMethod.id,
  });

  const pixUserWithPoleEmploiAuthenticationMethod = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Paul',
    lastName: 'Amplois',
    email: null,
    username: 'Paul.Amplois',
    rawPassword: 'Password123',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: pixUserWithPoleEmploiAuthenticationMethod.id,
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
  });

  const userWithPoleEmploiAuthenticationMethod = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Itai',
    lastName: 'Chrizanne',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: userWithPoleEmploiAuthenticationMethod.id,
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
  });

  const pixUserWithCnavAuthenticationMethod = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'David',
    lastName: 'Cnav',
    email: 'david.cnav@example.net',
    username: 'David.Cnav',
    rawPassword: 'Password123',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: pixUserWithCnavAuthenticationMethod.id,
    identityProvider: OidcIdentityProviders.CNAV.service.code,
  });

  const userWithCnavAuthenticationMethod = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Ashura',
    lastName: 'Onyinye',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: userWithCnavAuthenticationMethod.id,
    identityProvider: OidcIdentityProviders.CNAV.service.code,
  });

  const userWithMultiplesAuthenticationMethods = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Charity',
    lastName: 'Noble',
    email: 'charity.noble@example.net',
    username: 'Ch@rity.N0bl3',
    rawPassword: 'Password123',
    cgu: false,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: userWithMultiplesAuthenticationMethods.id,
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    userId: userWithMultiplesAuthenticationMethods.id,
    identityProvider: OidcIdentityProviders.CNAV.service.code,
  });
  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    externalIdentifier: `${userWithMultiplesAuthenticationMethods.firstName}.${userWithMultiplesAuthenticationMethods.lastName}.${userWithMultiplesAuthenticationMethods.id}`,
    userId: userWithMultiplesAuthenticationMethods.id,
    userFirstName: userWithMultiplesAuthenticationMethods.firstName,
    userLastName: userWithMultiplesAuthenticationMethods.lastName,
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

export default {
  usersBuilder,
  PIX_SUPER_ADMIN_ID,
  PIX_SUPPORT_ID,
  PIX_METIER_ID,
  PIX_CERTIF_ID,
  PIX_ALL_ORGA_ID,
  DEFAULT_PASSWORD,
};
