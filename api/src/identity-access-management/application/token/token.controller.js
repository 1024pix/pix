import { HttpErrors } from '../../../shared/application/http-errors.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { RefreshToken } from '../../domain/models/RefreshToken.js';
import { usecases } from '../../domain/usecases/index.js';
import { getForwardedOrigin, RequestedApplication } from '../../infrastructure/utils/network.js';
import { PKCEUtils } from '../../infrastructure/utils/pkce.js';
import { authorizationCodeStore } from './oauth.controller.js';

const authenticateAnonymousUser = async function (request, h) {
  const { campaign_code: campaignCode, lang } = request.payload;
  const origin = getForwardedOrigin(request.headers);
  const accessToken = await usecases.authenticateAnonymousUser({ campaignCode, lang, audience: origin });

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

  const origin = getForwardedOrigin(request.headers);
  const requestedApplication = RequestedApplication.fromOrigin(origin);

  const grantType = request.payload.grant_type;

  if (grantType === 'password') {
    const { username, password } = request.payload;
    const localeFromCookie = request.state?.locale;
    const source = 'pix';

    const tokensInfo = await usecases.authenticateUser({
      username,
      password,
      source,
      localeFromCookie,
      audience: origin,
      requestedApplication,
    });

    accessToken = tokensInfo.accessToken;
    refreshToken = tokensInfo.refreshToken;
    expirationDelaySeconds = tokensInfo.expirationDelaySeconds;
  } else if (grantType === 'refresh_token') {
    refreshToken = request.payload.refresh_token;

    const tokensInfo = await usecases.createAccessTokenFromRefreshToken({ refreshToken, audience: origin });

    accessToken = tokensInfo.accessToken;
    expirationDelaySeconds = tokensInfo.expirationDelaySeconds;
  } else if (grantType === 'authorization_code') {
    const { code, client_id: clientId, code_verifier: codeVerifier } = request.payload;

    const authorizationCode = authorizationCodeStore.findByCode(code);
    if (!authorizationCode) {
      throw new HttpErrors.BadRequestError('Invalid authorization code');
    }

    if (authorizationCode.clientId !== clientId) {
      throw new HttpErrors.BadRequestError('Client ID does not match the authorization code');
    }

    if (
      !PKCEUtils.validateCodeChallenge(
        authorizationCode.codeChallenge,
        codeVerifier,
        authorizationCode.codeChallengeMethod,
      )
    ) {
      throw new HttpErrors.BadRequestError('Invalid code verifier');
    }

    const userId = authorizationCode.userId;
    if (!userId) {
      throw new HttpErrors.BadRequestError('Authorization code does not have an associated user');
    }

    const accessTokenInfo = tokenService.createAccessTokenFromUser({ userId, source: 'pix', audience: origin });
    accessToken = accessTokenInfo.accessToken;
    expirationDelaySeconds = accessTokenInfo.expirationDelaySeconds;

    refreshToken = RefreshToken.generate({ userId, source: 'pix', audience: origin });
  }

  const userId = dependencies.tokenService.extractUserId(accessToken);

  return h
    .response({
      token_type: 'bearer',
      user_id: userId,
      access_token: accessToken,
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

const authenticateApplication = async function (request, h) {
  const { client_id: clientId, client_secret: clientSecret, scope } = request.payload;

  const accessToken = await usecases.authenticateApplication({ clientId, clientSecret, scope });

  return h
    .response({
      token_type: 'bearer',
      access_token: accessToken,
      client_id: clientId,
    })
    .code(200)
    .header('Content-Type', 'application/json;charset=UTF-8')
    .header('Cache-Control', 'no-store')
    .header('Pragma', 'no-cache');
};

export const tokenController = { authenticateAnonymousUser, createToken, revokeToken, authenticateApplication };
