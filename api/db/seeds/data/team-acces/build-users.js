import { REAL_PIX_SUPER_ADMIN_ID } from '../common/constants.js';
import { OIDC_PROVIDER_EXAMPLE_NET_IDENTITY_PROVIDER } from './constants.js';

function _buildUsers(databaseBuilder) {
  // User bare
  databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Justin',
    lastName: 'Compte',
    email: 'justin.compte@example.net',
  });

  // User with a recent lastLoggedAt and email confirmed
  const userWithLastLoggedAt = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Justin',
    lastName: 'Instant',
    email: 'justin.instant@example.net',
    emailConfirmedAt: new Date(),
  });
  databaseBuilder.factory.buildUserLogin({ userId: userWithLastLoggedAt.id, lastLoggedAt: new Date() });

  // User with an old createdAt (>1 year) and no email confirmation date
  databaseBuilder.factory.buildUser.withRawPassword({
    createdAt: new Date('1985-10-26'),
    firstName: 'Chrono',
    lastName: 'Scaphe',
    email: 'old-created-at@example.net',
    emailConfirmedAt: null,
  });

  // User with an old lastLoggedAt (>1 year) and no email confirmation date
  const userWithOldLastLoggedAt = databaseBuilder.factory.buildUser.withRawPassword({
    createdAt: new Date('1985-10-26'),
    firstName: 'Chrono',
    lastName: 'Gyre',
    email: 'old-last-logged-at@example.net',
    emailConfirmedAt: null,
  });
  databaseBuilder.factory.buildUserLogin({ userId: userWithOldLastLoggedAt.id, lastLoggedAt: new Date('1985-10-26') });

  // User with a userLogin but without lastLoggedAt
  const userWithoutLastLoggedAt = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Justin',
    lastName: 'Login',
    email: 'without-last-logged-at@example.net',
    emailConfirmedAt: null,
  });
  databaseBuilder.factory.buildUserLogin({ userId: userWithoutLastLoggedAt.id, lastLoggedAt: null });
}

function _buildOidcUser(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Oidc',
    lastName: 'OIDC',
    email: 'oidc-user@example.net',
  });
  databaseBuilder.factory.buildAuthenticationMethod.withOidcProviderAsIdentityProvider({
    userId: user.id,
    identityProvider: OIDC_PROVIDER_EXAMPLE_NET_IDENTITY_PROVIDER,
  });
}

function _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Paul',
    lastName: 'Emploi',
    email: 'paul-emploi@example.net',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
    userId: user.id,
  });
}

function _buildGarUser(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Gar',
    lastName: 'User',
    email: 'gar.user@example.net',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    userId: user.id,
  });
}

function _buildAnonymisedUser(databaseBuilder) {
  databaseBuilder.factory.buildUser({
    firstName: '(anonymised)',
    lastName: '(anonymised)',
    email: null,
    username: null,
    hasBeenAnonymised: true,
    hasBeenAnonymisedBy: REAL_PIX_SUPER_ADMIN_ID,
  });
}

export function buildUsers(databaseBuilder) {
  _buildUsers(databaseBuilder);
  _buildOidcUser(databaseBuilder);
  _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder);
  _buildGarUser(databaseBuilder);
  _buildAnonymisedUser(databaseBuilder);
}
