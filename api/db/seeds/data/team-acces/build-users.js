import * as OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers.js';

function _buildUserWithCnavAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'David',
    lastName: 'Cnav',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    identityProvider: OidcIdentityProviders.CNAV.code,
    userId: user.id,
  });
}

function _buildUserWithFwbAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Henry',
    lastName: 'Fwb',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    identityProvider: OidcIdentityProviders.FWB.code,
    userId: user.id,
  });
}

function _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Paul',
    lastName: 'Emploi',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
    userId: user.id,
  });
}

function _buildUsers(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Salvor',
    lastName: 'Hardin',
    username: 'salvor.hardin',
    email: 'salvor.hardin@foundation.verse',
  });

  const userWithLastLoggedAt = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Gaal',
    lastName: 'Dornick',
    username: 'gaal.dornick',
    email: 'gaal.dornick@foundation.verse',
  });
  databaseBuilder.factory.buildUserLogin({ userId: userWithLastLoggedAt.id, lastLoggedAt: new Date('1970-01-01') });

  // User with a specific createdAt
  databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Chrono',
    lastName: 'Post',
    username: 'chrono.post',
    email: 'chrono.post@example.net',
    createdAt: new Date('2000-12-31'),
  });
}

export function buildUsers(databaseBuilder) {
  _buildUsers(databaseBuilder);
  _buildUserWithCnavAuthenticationMethod(databaseBuilder);
  _buildUserWithFwbAuthenticationMethod(databaseBuilder);
  _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder);
}
