import { BadRequestError } from '../../../../lib/application/http-errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { usecases } from '../../domain/usecases/index.js';

const authenticateAnonymousUser = async function (request, h) {
  const { campaign_code: campaignCode, lang } = request.payload;
  const accessToken = await usecases.authenticateAnonymousUser({ campaignCode, lang });

  const response = {
    token_type: 'bearer',
    access_token: accessToken,
  };

  return h.response(response).code(200);
};

/**
 * @param request
 * @param h
 * @param {{
 *   tokenService: TokenService
 * }} dependencies
 * @return {Promise<*>}
 */
const createToken = async function (request, h, dependencies = { tokenService }) {
  let accessToken, refreshToken;
  let expirationDelaySeconds;

  if (request.payload.grant_type === 'refresh_token') {
    refreshToken = request.payload.refresh_token;
    const accessTokenAndExpirationDelaySeconds = await usecases.createAccessTokenFromRefreshToken({ refreshToken });
    accessToken = accessTokenAndExpirationDelaySeconds.accessToken;
    expirationDelaySeconds = accessTokenAndExpirationDelaySeconds.expirationDelaySeconds;
  } else if (request.payload.grant_type === 'password') {
    const { username, password, scope } = request.payload;
    const localeFromCookie = request.state?.locale;

    const source = 'pix';
    const tokensAndExpirationDelaySeconds = await usecases.authenticateUser({
      username,
      password,
      scope,
      source,
      localeFromCookie,
    });
    accessToken = tokensAndExpirationDelaySeconds.accessToken;
    refreshToken = tokensAndExpirationDelaySeconds.refreshToken;
    expirationDelaySeconds = tokensAndExpirationDelaySeconds.expirationDelaySeconds;
  } else {
    throw new BadRequestError('Invalid grant type');
  }

  return h
    .response({
      token_type: 'bearer',
      access_token: accessToken,
      user_id: dependencies.tokenService.extractUserId(accessToken),
      refresh_token: refreshToken,
      expires_in: expirationDelaySeconds,
    })
    .code(200)
    .header('Content-Type', 'application/json;charset=UTF-8')
    .header('Cache-Control', 'no-store')
    .header('Pragma', 'no-cache');
};

const revokeToken = async function (request, h) {
  if (request.payload.token_type_hint === 'access_token') return null;

  await usecases.revokeRefreshToken({ refreshToken: request.payload.token });
  return h.response().code(204);
};

export const tokenController = { authenticateAnonymousUser, createToken, revokeToken };
