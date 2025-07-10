import { BadRequestError, HttpErrors } from '../../../shared/application/http-errors.js';
import { config } from '../../../shared/config.js';
import { pixAuthenticationService } from '../../domain/services/pix-authentication-service.js';
import { usecases } from '../../domain/usecases/index.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { getForwardedOrigin, RequestedApplication } from '../../infrastructure/utils/network.js';
import { PKCEUtils } from '../../infrastructure/utils/pkce.js';
import { AuthorizationCodeStore } from './AuthorizationCode.js';

const authServer = {
  localhost: 'http://localhost:4206',
  fr: `${config.domain.pixAuth}.fr`,
  org: `${config.domain.pixAuth}.org`,
};

const authorizedClientIds = {
  'pix-orga': {
    authorizationCallbackUri: {
      localhost: 'http://localhost:4201/auth/callback',
      fr: `${config.domain.pixOrga}.fr/auth/callback`,
      org: `${config.domain.pixOrga}.org/auth/callback`,
    },
  },
  'pix-admin': {
    authorizationCallbackUri: {
      localhost: 'http://localhost:4202/auth/callback',
      fr: `${config.domain.pixAdmin}.fr/auth/callback`,
      org: `${config.domain.pixAdmin}.org/auth/callback`,
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
  const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, credentials } = req.payload;

  if (!authorizedClientIds[client_id]) {
    throw new HttpErrors.BadRequestError('Client not authorized');
  }

  const origin = getForwardedOrigin(req.headers);
  const originUrl = new URL(origin);
  const tld = originUrl.hostname.split('.').at(-1);

  const { authorizationCallbackUri } = authorizedClientIds[client_id];
  const clientCallbackUri = new URL(authorizationCallbackUri[tld] || authorizationCallbackUri.localhost);

  let user;

  if (credentials.username && credentials.password) {
    // Authenticate user with username and password
    user = await pixAuthenticationService.getUserByUsernameAndPassword({
      username: credentials.username,
      password: credentials.password,
      userRepository,
    });
  } else {
    // Authenticate user with OIDC
    const requestedApplication = RequestedApplication.fromOrigin(clientCallbackUri);

    const sessionState = req.yar.get('state', true);
    const nonce = req.yar.get('nonce', true);
    await req.yar.commit(h);

    if (sessionState === null) {
      throw new BadRequestError('Required "state" is missing in session', 'MISSING_OIDC_STATE');
    }

    user = await usecases.authenticateOidcUserForPoc({
      code: credentials.code,
      state: credentials.state,
      iss: credentials.iss,
      identityProviderCode: credentials.identity_provider,
      nonce,
      sessionState,
      audience: origin,
      requestedApplication,
    });
  }

  const { code } = authorizationCodeStore.create({
    clientId: client_id,
    userId: user.id,
    redirectUri: redirect_uri,
    scopes: [scope],
    state,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
  });

  const url = new URL(clientCallbackUri);
  url.searchParams.set('code', code);
  url.searchParams.set('redirect_uri', redirect_uri);
  if (state) url.searchParams.set('state', state);

  return h.response({ redirect: url.toString() });
};

export const oauthController = { authorize, generateAuthorizationCode };
