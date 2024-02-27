import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { DEFAULT_PASSWORD } from '../../../constants.js';
import { SCO_ORGANIZATION_ID } from './constants.js';

export function buildScoOrganizationLearners(databaseBuilder) {
  _buildScoOrganizationLearnerWithAllConnectionTypes(databaseBuilder);
  _buildScoOrganizationLearnerWithUsernameAndMediacentre(databaseBuilder);
  _buildScoOrganizationLearnerWithUsernameAndEmail(databaseBuilder);
  _buildScoOrganizationLearnerWithEmailAndMediacentre(databaseBuilder);
  _buildScoOrganizationLearnerWithEmail(databaseBuilder);
  _buildScoOrganizationLearnerWithUsername(databaseBuilder);
  _buildScoOrganizationLearnerWithMediacentre(databaseBuilder);
  _buildScoOrganizationLearnersWithoutConnectionType(databaseBuilder);
}
/**
 * @param {DatabaseBuilder} databaseBuilder
 */
function _buildScoOrganizationLearnerWithAllConnectionTypes(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Eliza',
    lastName: 'Delajungle',
    email: 'eliza-dlj@school.net',
    username: 'eliza.delajungle.0101',
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2011-01-01',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789ED',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    userFirstName: organizationLearner.firstName,
    userLastName: organizationLearner.lastName,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: 'externalED',
    userId: user.id,
  });
}

function _buildScoOrganizationLearnerWithUsernameAndMediacentre(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Bob',
    lastName: 'Leponge',
    email: null,
    username: 'bob.leponge.0202',
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2012-02-02',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789BL',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    userFirstName: organizationLearner.firstName,
    userLastName: organizationLearner.lastName,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: 'externalBL',
    userId: user.id,
  });
}

function _buildScoOrganizationLearnerWithUsernameAndEmail(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Naruto',
    lastName: 'Uzumaki',
    email: 'hokage@school.net',
    username: 'naruto.uzumaki.0303',
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2013-03-03',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789NU',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndPassword({
    userFirstName: organizationLearner.firstName,
    userLastName: organizationLearner.lastName,
    password: DEFAULT_PASSWORD,
    shouldChangePassword: false,
    userId: user.id,
  });
}

function _buildScoOrganizationLearnerWithEmailAndMediacentre(databaseBuilder) {
  const userWithoutPixAuthenticationMethod = databaseBuilder.factory.buildUser({
    firstName: 'Bart',
    lastName: 'Simpson',
    email: 'bart@school.net',
    username: null,
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: userWithoutPixAuthenticationMethod.firstName,
    lastName: userWithoutPixAuthenticationMethod.lastName,
    birthdate: '2010-03-03',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: userWithoutPixAuthenticationMethod.id,
    nationalStudentId: '123456789BS',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    userFirstName: organizationLearner.firstName,
    userLastName: organizationLearner.lastName,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: 'externalBS',
    userId: userWithoutPixAuthenticationMethod.id,
  });

  const userWithPixAuthenticationMethod = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Chihiro',
    lastName: 'Ogino',
    email: 'chihiro.ogino@miyazaki.net',
    username: null,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: userWithPixAuthenticationMethod.firstName,
    lastName: userWithPixAuthenticationMethod.lastName,
    birthdate: '2013-01-01',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: userWithPixAuthenticationMethod.id,
    nationalStudentId: '123456789CO',
  });
}

function _buildScoOrganizationLearnerWithEmail(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Hermione',
    lastName: 'Granger',
    email: 'hermione@school.net',
    username: null,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2013-03-03',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789HG',
  });
}

function _buildScoOrganizationLearnerWithUsername(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Kirua',
    lastName: 'Zoldik',
    email: null,
    username: 'hunter.0202',
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2013-03-03',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789KZ',
  });
}

function _buildScoOrganizationLearnerWithMediacentre(databaseBuilder) {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'Mikasa',
    lastName: 'Ackerman',
    email: null,
    username: null,
  });

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2014-04-04',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: user.id,
    nationalStudentId: '123456789MA',
  });

  databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
    userFirstName: organizationLearner.firstName,
    userLastName: organizationLearner.lastName,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: 'externalMA',
    userId: user.id,
  });
}

function _buildScoOrganizationLearnersWithoutConnectionType(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Nico',
    lastName: 'Robin',
    birthdate: '2010-10-10',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789NR',
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Izuku',
    lastName: 'Midoriya',
    birthdate: '2012-12-12',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789IZ',
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Edward',
    lastName: 'Elric',
    birthdate: '2012-12-12',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789EE',
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Harry',
    lastName: 'Potter',
    birthdate: '2012-12-12',
    division: '6B',
    group: null,
    organizationId: SCO_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789HP',
  });
}
