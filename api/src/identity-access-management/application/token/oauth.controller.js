import { HttpErrors } from '../../../shared/application/http-errors.js';
import { PKCEUtils } from '../../infrastructure/utils/pkce.js';

const authorizedClientIds = ['pix-orga'];

const authorize = async (req, h) => {
  const { response_type, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.query;

  if (!authorizedClientIds.includes(client_id)) {
    throw new HttpErrors.BadRequestError('Client not authorized');
  }

  if (response_type !== 'code') {
    throw new HttpErrors.BadRequestError('Response type is not supported');
  }

  if (!PKCEUtils.validateCodeChallengeMethod(code_challenge_method)) {
    throw new HttpErrors.BadRequestError('Code Challenge is not valid');
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

  return h.redirect(`http://localhost:4206?${params.toString()}`);
};

export const oauthController = { authorize };
