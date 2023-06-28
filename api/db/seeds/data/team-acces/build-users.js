import * as OidcIdentityProviders from '../../../../lib/shared/domain/constants/oidc-identity-providers.js';

function _buildUserWithCnavAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'David',
    lastName: 'Cnav',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    identityProvider: OidcIdentityProviders.CNAV.service.code,
    userId: user.id,
  });
}

function _buildUserWithFwbAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Henry',
    lastName: 'Fwb',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    identityProvider: OidcIdentityProviders.FWB.service.code,
    userId: user.id,
  });
}

function _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser.withoutPixAuthenticationMethod({
    firstName: 'Paul',
    lastName: 'Emploi',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
    userId: user.id,
  });
}

export function buildUsers(databaseBuilder) {
  _buildUserWithCnavAuthenticationMethod(databaseBuilder);
  _buildUserWithFwbAuthenticationMethod(databaseBuilder);
  _buildUserWithPoleEmploiAuthenticationMethod(databaseBuilder);
}
