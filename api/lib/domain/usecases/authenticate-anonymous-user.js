const { UserCantBeCreatedError } = require('../errors');
const UserToCreate = require('../models/UserToCreate');

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

  const accessToken = tokenService.createAccessTokenFromUser(newUser.id, 'pix').accessToken;
  return accessToken;
};
