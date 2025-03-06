/* eslint-disable n/no-unsupported-features/node-builtins */

import { createPublicKey, KeyObject, randomUUID } from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

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
let clientId;

function handleDeepLinkingRequest(token) {
  const deepLinkUrl = token['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'].deep_link_return_url;

  const jwtResponse = jsonwebtoken.sign(
    {
      iss: clientId,
      aud: deepLinkUrl,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        token['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
        {
          type: 'ltiResourceLink',
          title: 'Titre de la campagne',
          text: 'Campagne PIX dont la note sera envoyée dans Moodle',
          url: 'https://app.pix.fr/campagnes',
          lineItem: {
            scoreMaximum: 10,
          },
        },
        {
          type: 'ltiResourceLink',
          title: 'Campagne 2',
          text: 'Campagne PIX dont la note sera envoyée dans Moodle',
          url: 'https://app.pix.fr/connexion',
          // lineItem: {
          //   scoreMaximum: 7,
          //   label: 'compétence de la campagne',
          //   resourceId: 'id de la campagne ?',
          //   tag: 'originality',
          //   gradesReleased: true,
          // },
        },
      ],
    },
    KeyObject.from(key.privateKey),
    {
      expiresIn: 3600,
      algorithm: 'RS256',
      keyid,
    },
  );

  return `
      <form id="ltiAuthForm" name="ltiAuthForm" action="${deepLinkUrl}" method="POST" enctype="application/x-www-form-urlencoded">
        <input type="hidden" name="JWT" value="${jwtResponse}">
      </form>
      <script type="text/javascript">
        document.ltiAuthForm.submit();
      </script>
    `;
}

async function serviceAuthFlow(request) {
  // TODO : remplacer par l'url du mooddle : plateform
  const tokenURL = new URL('/mod/lti/token.php', request.payload.iss);

  const client_assertion = jsonwebtoken.sign(
    {
      // TODO : remplacer par une origine en dur à nous
      iss: new URL(request.payload.target_link_uri).origin,
      // TODO: avoir enregistrer la plateforme et avoir un sub
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

  // TODO : remplacer par l'url du mooddle : plateform
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

async function verifyToken(encodedToken, keysURL) {
  const decodedToken = jsonwebtoken.decode(encodedToken, { complete: true });

  const keysRes = await fetch(keysURL);
  if (!keysRes.ok) {
    logger.error({ status: keysRes.statusText, payload: await keysRes.text() }, 'could not fetch keys');
    throw new Error(); // FIXME
  }

  const { keys } = await keysRes.json();

  const key = keys.find(({ kid }) => kid === decodedToken.header.kid);
  if (key === undefined) {
    logger.error({ kid: decodedToken.header.kid }, 'could not find key');
  }

  return jsonwebtoken.verify(encodedToken, createPublicKey({ key, format: 'jwk' }));
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
    logger.info({ payload: request.payload, url: request.url.origin }, 'Init');
    clientId = request.payload.client_id;

    const authUrl = new URL('/mod/lti/auth.php', request.payload.iss);

    const origin = new URL(request.url.origin);
    origin.protocol = 'https'; // force HTTPS because for tunnelmole

    const form = `
      <form id="ltiAuthForm" name="ltiAuthForm" action="${authUrl.href}" method="POST" enctype="application/x-www-form-urlencoded">
        <input type="hidden" name="client_id" value="${request.payload.client_id}">
        <input type="hidden" name="login_hint" value="${request.payload.login_hint}">
        <input type="hidden" name="scope" value="openid">
        <input type="hidden" name="redirect_uri" value="${new URL('/api/lti/launch', origin)}">
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

    const verifiedToken = await verifyToken(encodedToken, certsURL);

    // "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingRequest",
    const messageType = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    if (messageType === 'LtiDeepLinkingRequest') {
      logger.info('deep linking');
      const form = handleDeepLinkingRequest(verifiedToken);
      return h.response(form).header('Content-Type', 'text/html; charset=utf-8');
    }

    const targetLinkUri = verifiedToken['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'];

    // TODO : chercher l'user et le créer si pas existant
    const token = tokenService.createAccessTokenFromUser({ userId: 100000, source: 'app', audience: 'pix' });

    return h.redirect(targetLinkUri).header('NOTRE_RETOUR', JSON.stringify(token));
  },
  contentSelection(request) {
    logger.info('Séléction du contenu');
    logger.info({ payload: request.payload }, 'Launch');
    // récupérer la deep_link_return_url

    return 'choisis ton contenu';
  },
  async formSubmitContentSelection(request, h) {},
  async config(request, h) {
    const ltiPlatformConfigRes = await fetch(request.query.openid_configuration);
    if (!ltiPlatformConfigRes.ok) {
      logger.error(
        { status: ltiPlatformConfigRes.statusText, payload: await ltiPlatformConfigRes.text() },
        'could not fetch LMS configuration',
      );
      throw new Error(); // FIXME
    }
    const ltiPlatformConfig = await ltiPlatformConfigRes.json();
    logger.info({ config: ltiPlatformConfig }, 'LTI platform configuration');

    // FIXME validate platform config
    // FIXME check registration URL has issuer as origin...

    // FIXME is it necessary to verify the jwt against the platform keys? probably better...
    const registrationToken = await verifyToken(request.query.registration_token, ltiPlatformConfig.jwks_uri);
    logger.info({ token: registrationToken }, 'verified LMS registration key');

    const origin = new URL(request.url.origin);
    origin.protocol = 'https'; // force HTTPS because for tunnelmole

    // FIXME reuse some of ltiPlatformConfig fields
    const ltiPixConfig = {
      application_type: 'web',
      grant_types: ['implicit', 'client_credentials'],
      response_types: ['id_token'],
      redirect_uris: [new URL('/api/lti/launch', origin).href],
      initiate_login_uri: new URL('/api/lti/init', origin).href,
      client_name: 'Pix',
      jwks_uri: new URL('/api/lti/keys', origin).href,
      token_endpoint_auth_method: 'private_key_jwt',
      scope: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ].join(' '),
      'https://purl.imsglobal.org/spec/lti-tool-configuration': {
        domain: request.url.host,
        target_link_uri: new URL('/api/lti', origin).href, // FIXME?
        messages: [
          {
            type: 'LtiDeepLinkingRequest',
            target_link_uri: new URL('/api/lti/content-selection', origin).href,
            label: 'Select a campaign',
            'label#fr': 'Séléctionner une campagne',
            supported_types: ['ltiResourceLink'],
            placements: ['ContentArea'],
          },
        ],
        claims: ltiPlatformConfig.claims_supported,
      },
    };

    const registrationRes = await fetch(ltiPlatformConfig.registration_endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${request.query.registration_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ltiPixConfig),
    });

    if (!registrationRes.ok) {
      logger.error(
        { status: registrationRes.statusText, payload: await registrationRes.text() },
        'registration failed',
      );
      throw new Error(); // FIXME
    }

    logger.info({ payload: await registrationRes.json() }, 'registration succeeded');

    return h
      .response(
        `
      <html>
        <body>
          <script type="text/javascript">
            (window.opener ?? window.parent).postMessage({ subject:'org.imsglobal.lti.close' }, '*');
          </script>
        </body>
      </html>
    `,
      )
      .header('Content-Type', 'text/html; charset=utf-8');
  },
  async score(_, h) {
    // TODO : remplacer par l'url du mooddle : plateform
    const tokenURL = new URL('https://moodle.pix.digital/mod/lti/token.php');

    const client_assertion = jsonwebtoken.sign(
      {
        // TODO : remplacer par une origine en dur à nous
        iss: 'https://moodle.pix.digital',
        // TODO: avoir enregistrer la plateforme et avoir un sub
        sub: clientId ?? 'fbnjHCv7IblNfwI',
        aud: tokenURL.href,
      },
      KeyObject.from(key.privateKey),
      {
        expiresIn: 3600,
        algorithm: 'RS256',
        keyid,
      },
    );

    // TODO : remplacer par l'url du mooddle : plateform
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

    const payload = await res.json();
    logger.info(
      {
        client_assertion,
        status: res.statusText,
        payload,
        headers: res.headers,
      },
      'Réponse token',
    );

    // TODO: enregistrer la scoring URL lors du launch de la campagne
    // TODO: enregistrer le userId également
    // TODO: enregistrer l'URL de retour
    const scoreUrl = new URL(
      'https://moodle.pix.digital/mod/lti/services.php/4/lineitems/10/lineitem/scores?type_id=2',
    );
    const score = {
      scoreGiven: 83,
      scoreMaximum: 100,
      comment: 'This is exceptional work.',
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
      timestamp: new Date().toISOString(),
      userId: 2,
    };
    const scoreRes = await fetch(scoreUrl, {
      method: 'POST',
      headers: {
        Authorization: payload.token_type + ' ' + payload.access_token,
        'Content-Type': 'application/vnd.ims.lis.v1.score+json',
      },
      body: JSON.stringify(score),
    });
    logger.info(
      {
        status: scoreRes.statusText,
        payload: await scoreRes.text(),
        headers: scoreRes.headers,
      },
      'Score response',
    );

    return h.response();
    // Send score
  },
};

/* eslint-enable n/no-unsupported-features/node-builtins */
