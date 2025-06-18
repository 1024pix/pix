import { UserCantBeCreatedError } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @param {{
 *   campaignCode: string,
 *   audience: string,
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
  audience,
  campaignToJoinRepository,
  userToCreateRepository,
  anonymousUserTokenRepository,
  tokenService,
}) {
  const campaign = await campaignToJoinRepository.getByCode({ code: campaignCode });
  if (!campaign.isSimplifiedAccess) {
    throw new UserCantBeCreatedError();
  }

  const userToCreate = UserToCreate.createAnonymous({ lang });

  const anonymousUser = await userToCreateRepository.create({ user: userToCreate });
  await anonymousUserTokenRepository.save(anonymousUser.id);

  return tokenService.createAccessTokenFromAnonymousUser({ userId: anonymousUser.id, audience });
};
