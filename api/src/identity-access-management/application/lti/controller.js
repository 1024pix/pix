/* eslint-disable n/no-unsupported-features/node-builtins */

import { createPublicKey, KeyObject, randomUUID } from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { child } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('lti', { event: 'lti' });

const key = await crypto.subtle.generateKey(
  {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 4096,
    hash: 'SHA-256',
    publicExponent: new Uint8Array([1, 0, 1]), // FIXME kezako?
  },
  true,
  ['sign', 'verify'],
);

const keyid = randomUUID();

async function authFlow(request) {
  const tokenURL = new URL('/mod/lti/token.php', request.payload.iss);

  const client_assertion = jsonwebtoken.sign(
    {
      iss: new URL(request.payload.target_link_uri).origin,
      sub: request.payload.client_id,
      aud: tokenURL.href,
    },
    KeyObject.from(key.privateKey),
    {
      expiresIn: 3600,
      algorithm: 'RS256',
      keyid,
    },
  );

  const res = await fetch(tokenURL, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion,
      scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
    }),
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
  });

  logger.info(
    {
      client_assertion,
      status: res.statusText,
      payload: await res.text(),
      headers: res.headers,
    },
    'Réponse token',
  );
}

export const ltiController = {
  async getKeys() {
    logger.info('Lecture des clés');

    // eslint-disable-next-line no-unused-vars
    const { ext, key_ops, ...jwk } = await crypto.subtle.exportKey('jwk', key.publicKey);

    jwk.kid = keyid;

    // FIXME ajouter use:sign?

    return {
      keys: [jwk],
    };
  },
  async init(request, h) {
    logger.info({ payload: request.payload }, 'Init');

    const authUrl = new URL('/mod/lti/auth.php', request.payload.iss);

    const form = `
      <form id="ltiAuthForm" name="ltiAuthForm" action="${authUrl.href}" method="POST" enctype="application/x-www-form-urlencoded">
        <input type="hidden" name="client_id" value="${request.payload.client_id}">
        <input type="hidden" name="login_hint" value="${request.payload.login_hint}">
        <input type="hidden" name="scope" value="openid">
        <input type="hidden" name="redirect_uri" value="${new URL('/api/lti/launch', request.payload.target_link_uri)}">
        <input type="hidden" name="nonce" value="${randomUUID()}">
        <input type="hidden" name="response_type" value="id_token">
        <input type="hidden" name="lti_message_hint">
        <input type="hidden" name="response_mode" value="form_post">
      </form>
      <script type="text/javascript">
        document.ltiAuthForm.lti_message_hint.value = ${JSON.stringify(request.payload.lti_message_hint)};
        document.ltiAuthForm.submit();
      </script>
    `;

    return h.response(form).header('Content-Type', 'text/html; charset=utf-8');
  },
  async launch(request, h) {
    logger.info({ payload: request.payload }, 'Launch');
    const encodedToken = request.payload.id_token;

    const decodedToken = jsonwebtoken.decode(encodedToken, { complete: true });

    const certsURL = new URL('/mod/lti/certs.php', decodedToken.payload.iss);
    const keysResponse = await fetch(certsURL);

    const keys = JSON.parse(await keysResponse.text());

    const key = keys.keys.find(({ kid }) => kid === decodedToken.header.kid);

    const verifyToken = jsonwebtoken.verify(encodedToken, createPublicKey({ key, format: 'jwk' }));

    const targetLinkUri = verifyToken['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'];

    // TODO : chercher l'user et le créer si pas existant
    const token = tokenService.createAccessTokenFromUser({ userId: 100000, source: 'app', audience: 'pix' });

    return h.redirect(targetLinkUri).header('NOTRE_RETOUR', JSON.stringify(token));
  },
  contentSelection() {
    logger.info('Séléction du contenu');

    return 'choisis ton contenu';
  },
};

/* eslint-enable n/no-unsupported-features/node-builtins */
