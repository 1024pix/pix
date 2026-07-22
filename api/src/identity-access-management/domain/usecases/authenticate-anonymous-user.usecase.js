import { UserCantBeCreatedError } from '../errors.js';
import { UserAccessToken } from '../models/UserAccessToken.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @param {{
 *   campaignCode: string,
 *   audience: string,
 *   lang: string,
 *   locale: string,
 *   campaignToJoinRepository,
 *   userToCreateRepository,
 *   tokenService
 *   authenticationSessionService
 * }} params
 * @return {Promise<string>}
 * @throws {UserCantBeCreatedError}
 */
export const authenticateAnonymousUser = async function ({
  campaignCode,
  lang = 'fr',
  locale,
  audience,
  campaignToJoinRepository,
  userToCreateRepository,
  authenticationSessionService,
}) {
  const campaign = await campaignToJoinRepository.getByCode({ code: campaignCode });
  if (!campaign.isSimplifiedAccess) {
    throw new UserCantBeCreatedError();
  }

  const userToCreate = UserToCreate.createAnonymous({ lang, locale });
  const anonymousUser = await userToCreateRepository.create({ user: userToCreate });

  const sessionId = authenticationSessionService.generateSessionId();

  const { accessToken } = UserAccessToken.generateAnonymousUserToken({ userId: anonymousUser.id, audience, sessionId });
  return accessToken;
};
