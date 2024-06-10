import { randomUUID } from 'node:crypto';

import { usecases } from '../../domain/usecases/index.js';

const authenticateExternalUser = async function (request, h) {
  const {
    username,
    password,
    'external-user-token': externalUserToken,
    'expected-user-id': expectedUserId,
  } = request.payload.data.attributes;

  const accessToken = await usecases.authenticateExternalUser({
    username,
    password,
    externalUserToken,
    expectedUserId,
  });

  const response = {
    data: {
      attributes: {
        'access-token': accessToken,
      },
      id: randomUUID(),
      type: 'external-user-authentication-requests',
    },
  };
  return h.response(response).code(200);
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

const revokeToken = async function (request, h) {
  if (request.payload.token_type_hint === 'access_token') return null;

  await usecases.revokeRefreshToken({ refreshToken: request.payload.token });
  return h.response().code(204);
};

const authenticationController = {
  authenticateExternalUser,
  authenticateApplication,
  revokeToken,
};

export { authenticationController };
