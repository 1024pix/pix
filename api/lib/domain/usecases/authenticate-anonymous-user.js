import { UserToCreate } from '../../../src/identity-access-management/domain/models/UserToCreate.js';
import { UserCantBeCreatedError } from '../errors.js';

const authenticateAnonymousUser = async function ({
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

export { authenticateAnonymousUser };
