const { UserCantBeCreatedError } = require('../errors.js');
const UserToCreate = require('../models/UserToCreate.js');

module.exports = async function authenticateAnonymousUser({
  campaignCode,
  lang = 'fr',
  campaignToJoinRepository,
  userToCreateRepository,
  tokenService,
}) {
  const campaign = await campaignToJoinRepository.getByCode(campaignCode);
  if (!campaign.isSimplifiedAccess) {
    throw new UserCantBeCreatedError();
  }

  const userToAdd = UserToCreate.createAnonymous({ lang });
  const newUser = await userToCreateRepository.create({ user: userToAdd });

  return tokenService.createAccessTokenFromAnonymousUser(newUser.id);
};
