import { HttpErrors } from '../../../shared/application/http-errors.js';
import { pixAuthenticationService } from '../../domain/services/pix-authentication-service.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { getForwardedOrigin } from '../../infrastructure/utils/network.js';
import { PKCEUtils } from '../../infrastructure/utils/pkce.js';
import { AuthorizationCodeStore } from './AuthorizationCode.js';

const authServer = {
  localhost: 'http://localhost:4206',
  fr: 'https://auth.dev.pix.fr',
  org: 'https://auth.dev.pix.org',
};

const authorizedClientIds = {
  'pix-orga': {
    authorizationCallbackUri: {
      localhost: 'http://localhost:4201/auth/callback',
      fr: 'https://orga.dev.pix.fr/auth/callback',
      org: 'https://orga.dev.pix.org/auth/callback',
    },
  },
  'pix-admin': {
    authorizationCallbackUri: {
      localhost: 'http://localhost:4202/auth/callback',
      fr: 'https://admin.dev.pix.fr/auth/callback',
      org: 'https://admin.dev.pix.org/auth/callback',
    },
  },
};

export const authorizationCodeStore = new AuthorizationCodeStore();

const authorize = async (req, h) => {
  const { response_type, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.query;

  const origin = getForwardedOrigin(req.headers);
  const originUrl = new URL(origin);
  const tld = originUrl.hostname.split('.').at(-1);
  const authServerUrl = authServer[tld] || authServer.localhost;

  if (!authorizedClientIds[client_id]) {
    throw new HttpErrors.BadRequestError('Client not authorized');
  }

  const { authorizationCallbackUri } = authorizedClientIds[client_id];
  const url = new URL(authorizationCallbackUri[tld] || authorizationCallbackUri.localhost);

  if (response_type !== 'code') {
    url.searchParams.set('error', 'unsupported_response_type');
    return h.response({ redirect: url.toString() });
  }

  if (!PKCEUtils.validateCodeChallengeMethod(code_challenge_method)) {
    url.searchParams.set('error', 'invalid_request');
    url.searchParams.set('error_description', 'Invalid code challenge');
    return h.response({ redirect: url.toString() });
  }

  const params = new URLSearchParams({
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method,
  });

  return h.response({ redirect: `${authServerUrl}/?${params.toString()}` });
};

const generateAuthorizationCode = async (req, h) => {
  const { username, password, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } =
    req.payload;

  if (!authorizedClientIds[client_id]) {
    throw new HttpErrors.BadRequestError('Client not authorized');
  }

  const user = await pixAuthenticationService.getUserByUsernameAndPassword({
    username,
    password,
    userRepository,
  });

  const { code } = authorizationCodeStore.create({
    clientId: client_id,
    userId: user.id,
    redirectUri: redirect_uri,
    scopes: [scope],
    state,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
  });

  const origin = getForwardedOrigin(req.headers);
  const originUrl = new URL(origin);
  const tld = originUrl.hostname.split('.').at(-1);

  const { authorizationCallbackUri } = authorizedClientIds[client_id];

  const url = new URL(authorizationCallbackUri[tld] || authorizationCallbackUri.localhost);
  url.searchParams.set('code', code);
  url.searchParams.set('redirect_uri', redirect_uri);
  if (state) url.searchParams.set('state', state);

  return h.response({ redirect: url.toString() });
};

export const oauthController = { authorize, generateAuthorizationCode };
