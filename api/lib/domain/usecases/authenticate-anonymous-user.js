const User = require('../models/User');
const { UserCantBeCreatedError } = require('../errors');

module.exports = async function authenticateAnonymousUser({
  campaignCode,
  lang = 'fr',
  campaignToJoinRepository,
  userRepository,
  tokenService,
}) {

  const campaign = await campaignToJoinRepository.getByCode(campaignCode);
  if (!campaign.isSimplifiedAccess) {
    throw new UserCantBeCreatedError();
  }

  const newUser = await userRepository.create({
    user: new User({
      firstName: '',
      lastName: '',
      cgu: false,
      mustValidateTermsOfService: false,
      isAnonymous: true,
      lang,
    }),
  });

  const accessToken = tokenService.createAccessTokenFromUser(newUser.id, 'pix');
  return accessToken;
};
