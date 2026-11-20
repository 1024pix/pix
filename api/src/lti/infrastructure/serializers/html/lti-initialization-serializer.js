const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function serialize({ targetLinkUri, clientId, loginHint, ltiMessageHint, authorizationEndpoint, nonce, state }) {
  return `<!doctype html>
<html>
  <body>
    <form id="ltiAutoSubmitForm" name="ltiAutoSubmitForm" action="${authorizationEndpoint}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="client_id" value="${clientId}">
      <input type="hidden" name="login_hint" value="${loginHint}">
      <input type="hidden" name="scope" value="openid">
      <input type="hidden" name="redirect_uri" value="${targetLinkUri}">
      <input type="hidden" name="nonce" value="${nonce}">
      <input type="hidden" name="state" value="${state}">
      <input type="hidden" name="response_type" value="id_token">
      <input type="hidden" name="lti_message_hint" value="${escapeHtml(ltiMessageHint)}">
      <input type="hidden" name="response_mode" value="form_post">
    </form>
    <script>document.ltiAutoSubmitForm.submit();</script>
  </body>
</html>
`;
}

export const ltiInitializationSerializer = { serialize };
