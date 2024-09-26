import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { SCO_NO_GAR_ORGANIZATION_ID, SCO_ORGANIZATION_ID } from './constants.js';

export function buildScoOrganizationLearners(databaseBuilder) {
  _buildScoOrganizationLearnerWithAllConnectionTypes(databaseBuilder);
  _buildScoOrganizationLearnerWithUsernameAndMediacentre(databaseBuilder);
  _buildScoOrganizationLearnerWithUsernameAndEmail(databaseBuilder);
  _buildScoOrganizationLearnerWithEmailAndMediacentre(databaseBuilder);
  _buildScoOrganizationLearnerWithEmail(databaseBuilder);
  _buildScoOrganizationLearnerWithUsername(databaseBuilder);
  _buildScoOrganizationLearnerWithMediacentre(databaseBuilder);
  _buildScoOrganizationLearnersWithoutConnectionType(databaseBuilder);
  _buildScoNoGarOrganizationLearnersWithoutConnectionType(databaseBuilder);
}

function _buildScoOrganizationLearnerWithAllConnectionTypes(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Eliza',
    lastName: 'Delajungle',
    email: 'eliza-dlj@school.net',
    username: 'eliza.delajungle.0101',
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Kelly',
    lastName: 'Coptere',
    email: 'kelly-coptere@school.net',
    username: 'kelly.coptere.0101',
  });

  const scoUserDetails = {
    ...scoUser,
    externalIdentifier: 'externalED',
    nationalStudentId: '123456789ED',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    externalIdentifier: 'externalKC',
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789KC',
  };

  _buildOrganizationLearners({
    birthdate: '2011-01-01',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
    withGarAuthenticationMethod: true,
  });
}

function _buildScoOrganizationLearnerWithUsernameAndMediacentre(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Bob',
    lastName: 'Leponge',
    email: null,
    username: 'bob.leponge.0202',
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Hector',
    lastName: 'Ticolis',
    email: null,
    username: 'hector.ticolis.0202',
  });

  const scoUserDetails = {
    ...scoUser,
    externalIdentifier: 'externalBL',
    nationalStudentId: '123456789BL',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    externalIdentifier: 'externalHT',
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789HT',
  };

  _buildOrganizationLearners({
    birthdate: '2012-02-02',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
    withGarAuthenticationMethod: true,
  });
}

function _buildScoOrganizationLearnerWithUsernameAndEmail(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Naruto',
    lastName: 'Uzumaki',
    email: 'hokage@school.net',
    username: 'naruto.uzumaki.0303',
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Jean',
    lastName: 'Serien',
    email: 'jean.serien@school.net',
    username: 'jean.serien.0303',
  });

  const scoUserDetails = {
    ...scoUser,
    nationalStudentId: '123456789NU',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789JS',
  };

  _buildOrganizationLearners({
    birthdate: '2013-03-03',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
    withGarAuthenticationMethod: false,
  });
}

function _buildScoOrganizationLearnerWithEmailAndMediacentre(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Bart',
    lastName: 'Simpson',
    email: 'bart@school.net',
    username: null,
  });

  const scoOtherUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Chihiro',
    lastName: 'Ogino',
    email: 'chihiro.ogino@miyazaki.net',
    username: null,
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Emma',
    lastName: 'Gnolia',
    email: 'emma.gnolia@school.net',
    username: null,
  });

  const scoUserDetails = {
    ...scoUser,
    externalIdentifier: 'externalBS',
    nationalStudentId: '123456789BS',
    organizationId: SCO_ORGANIZATION_ID,
  };

  const scoOtherUserDetails = {
    ...scoOtherUser,
    externalIdentifier: 'externalCO',
    nationalStudentId: '123456789CO',
    organizationId: SCO_ORGANIZATION_ID,
  };

  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    externalIdentifier: 'externalEG',
    nationalStudentId: '123456789EG',
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
  };

  _buildOrganizationLearners({
    birthdate: '2013-04-04',
    databaseBuilder,
    users: [scoUserDetails, scoOtherUserDetails, scoNoGarUserDetails],
    withGarAuthenticationMethod: true,
  });
}

function _buildScoOrganizationLearnerWithEmail(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Hermione',
    lastName: 'Granger',
    email: 'hermione@school.net',
    username: null,
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Melanie',
    lastName: 'Croche',
    email: 'melanie.croche@school.net',
    username: null,
  });

  const scoUserDetails = {
    ...scoUser,
    nationalStudentId: '123456789HG',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789MC',
  };

  _buildOrganizationLearners({
    birthdate: '2013-05-05',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
  });
}

function _buildScoOrganizationLearnerWithUsername(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Kirua',
    lastName: 'Zoldik',
    email: null,
    username: 'hunter.0202',
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Luc',
    lastName: 'Ratif',
    email: null,
    username: 'luc.ratif.0202',
  });

  const scoUserDetails = {
    ...scoUser,
    nationalStudentId: '123456789KZ',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789LR',
  };

  _buildOrganizationLearners({
    birthdate: '2013-06-06',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
  });
}

function _buildScoOrganizationLearnerWithMediacentre(databaseBuilder) {
  const scoUser = databaseBuilder.factory.buildUser({
    firstName: 'Mikasa',
    lastName: 'Ackerman',
    email: null,
    username: null,
  });

  const scoNoGarUser = databaseBuilder.factory.buildUser({
    firstName: 'Otto',
    lastName: 'Matique',
    email: null,
    username: null,
  });

  const scoUserDetails = {
    ...scoUser,
    externalIdentifier: 'externalMA',
    nationalStudentId: '123456789MA',
    organizationId: SCO_ORGANIZATION_ID,
  };
  const scoNoGarUserDetails = {
    ...scoNoGarUser,
    externalIdentifier: 'externalOM',
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    nationalStudentId: '123456789OM',
  };

  _buildOrganizationLearners({
    birthdate: '2014-04-04',
    databaseBuilder,
    users: [scoUserDetails, scoNoGarUserDetails],
    withGarAuthenticationMethod: true,
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

function _buildScoNoGarOrganizationLearnersWithoutConnectionType(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Maude',
    lastName: 'Javel',
    birthdate: '2014-05-05',
    division: '6B',
    group: null,
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789MJ',
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Solange',
    lastName: 'Oliveur',
    birthdate: '2014-05-05',
    division: '6B',
    group: null,
    organizationId: SCO_NO_GAR_ORGANIZATION_ID,
    userId: null,
    nationalStudentId: '123456789SO',
  });
}

function _buildOrganizationLearners({ birthdate, databaseBuilder, users, withGarAuthenticationMethod = false }) {
  users.forEach(({ id: userId, externalIdentifier, firstName, lastName, nationalStudentId, organizationId }) => {
    databaseBuilder.factory.buildOrganizationLearner({
      firstName,
      lastName,
      birthdate,
      division: '6B',
      group: null,
      organizationId,
      userId,
      nationalStudentId,
    });

    if (withGarAuthenticationMethod) {
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userFirstName: firstName,
        userLastName: lastName,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        externalIdentifier,
        userId,
      });
    }
  });
}
