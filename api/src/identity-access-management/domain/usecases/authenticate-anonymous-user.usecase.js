import { UserCantBeCreatedError } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @param {{
 *   campaignCode: string,
 *   lang: string,
 *   campaignToJoinRepository,
 *   userToCreateRepository,
 *   tokenService
 * }} params
 * @return {Promise<string>}
 * @throws {UserCantBeCreatedError}
 */
export const authenticateAnonymousUser = async function ({
  campaignCode,
  lang = 'fr',
  campaignToJoinRepository,
  userToCreateRepository,
  tokenService,
}) {
  const campaign = await campaignToJoinRepository.getByCode({ code: campaignCode });
  if (!campaign.isSimplifiedAccess) {
    throw new UserCantBeCreatedError();
  }

  const userToAdd = UserToCreate.createAnonymous({ lang });
  const newUser = await userToCreateRepository.create({ user: userToAdd });

  return tokenService.createAccessTokenFromAnonymousUser(newUser.id);
};
