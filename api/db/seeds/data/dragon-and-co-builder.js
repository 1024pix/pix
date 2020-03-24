const _ = require('lodash');

const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');

module.exports = function addDragonAndCoWithrelated({ databaseBuilder }) {

  const proUserDaenerys = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 2,
    firstName: 'Daenerys',
    lastName: 'Targaryen',
    email: 'pro@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  const proUserGreyWorm = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 8,
    firstName: 'Thorgo',
    lastName: 'Nudo',
    email: 'unsullied@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  const dragonAndCoCompany = databaseBuilder.factory.buildOrganization({
    id: 1,
    type: 'PRO',
    name: 'Dragon & Co',
    logoUrl: require('../src/dragonAndCoBase64'),
    canCollectProfiles: true,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUserDaenerys.id,
    organizationId: dragonAndCoCompany.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUserGreyWorm.id,
    organizationId: dragonAndCoCompany.id,
    organizationRole: Membership.roles.MEMBER,
  });

  const privateTargetProfile = databaseBuilder.factory.buildTargetProfile({
    id: 2,
    name: 'Résoudre des problèmes techniques (compétence 5.1)',
    isPublic: false,
    organizationId: dragonAndCoCompany.id,
  });

  [
    'recGd7oJ2wVEyKmPS', 'recHvlTH8v706UYvc', 'recl2o6fA6oyMGPkb', 'recVgnoo6RjCxjCQp', 'recUQEnFmSvPBA807',
    'recINVk1gM5DHCbs7', 'recpyHTeNkGnFnqhZ', 'rec9iiMaoi1GLzWVn', 'rec336WB21z6wKR6q', 'recVywppdS4hGEekR',
    'recIcL3GuLDaDgGAt', 'recOyQOjUhDKTO7UN', 'recO6p9wxUDweUysu', 'recrxbonOSuEvsuor', 'recDZTKszXX02aXD1',
    'rec8b2zEqznu1VdSu', 'rectZKS13rdkqxHer', 'recW4iZCujkyyfCve', 'recxij74P8pBL3pdq', 'recmB2623CruGvA1b',
    'recIOtIleMBECQayX', 'recEPgGwP6P3nZBbK', 'recbZ44oYHqlOGJ2C', 'recU78yTsZnxIghHA', 'recDkqabsU2X5a4Z5',
    'recVv1eoSLW7yFgXv', 'recvBiIG0dvHJOe7i', 'reca2TivtMI9QRWBY', 'recSF5OuzyBOfg97L', 'recUdMS2pRSF4sgnk',
    'recr9No0p5zGhq2bg', 'recWalmeLbapvhX3K', 'recKTybfk95zVWBDM', 'recKFUQ2CzcYHrxPR'
  ]
    .forEach((skillId) => {
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: privateTargetProfile.id, skillId });
    });

  const proUserSub = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 6,
    firstName: 'Viserys',
    lastName: 'Targaryen',
    email: 'prosub@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  const dragonAndCoSubsidiary = databaseBuilder.factory.buildOrganization({
    id: 4,
    type: 'PRO',
    name: 'Dragon subsidiary',
  });

  databaseBuilder.factory.buildMembership({
    userId: proUserSub.id,
    organizationId: dragonAndCoSubsidiary.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildTargetProfileShare({
    targetProfileId: privateTargetProfile.id,
    organizationId: dragonAndCoSubsidiary.id
  });

  const proUserSub2 = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 7,
    firstName: 'Rhaegon',
    lastName: 'Targaryen',
    email: 'prosub2@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  const dragonAndCoSubsidiary2 = databaseBuilder.factory.buildOrganization({
    id: 5,
    type: 'PRO',
    name: 'Dragon subsidiary 2',
  });

  databaseBuilder.factory.buildMembership({
    userId: proUserSub2.id,
    organizationId: dragonAndCoSubsidiary2.id,
    organizationRole: Membership.roles.ADMIN,
  });

  const invitedUsers = [];
  _.each([
    { lastName: 'USER_TO_INVITE', rawPassword: 'pix123', cgu: true },
    { lastName: 'USER_TO_INVITE', rawPassword: 'pix123', cgu: true },
  ], (user) => {
    invitedUsers.push(databaseBuilder.factory.buildUser.withUnencryptedPassword(user));
  });

  databaseBuilder.factory.buildOrganizationInvitation({
    email: invitedUsers[0].email,
    status: OrganizationInvitation.StatusType.PENDING,
    organizationId: dragonAndCoCompany.id,
  });

};
