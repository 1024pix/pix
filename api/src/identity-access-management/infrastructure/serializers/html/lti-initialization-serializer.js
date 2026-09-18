function serialize({ baseUrl, clientId, loginHint, ltiMessageHint, authorizationEndpoint, nonce, state }) {
  return `<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAuthForm" name="ltiAuthForm" action="${authorizationEndpoint}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="client_id" value="${clientId}">
      <input type="hidden" name="login_hint" value="${loginHint}">
      <input type="hidden" name="scope" value="openid">
      <input type="hidden" name="redirect_uri" value="${new URL('/api/lti/launch', baseUrl)}">
      <input type="hidden" name="nonce" value="${nonce}">
      <input type="hidden" name="state" value="${state}">
      <input type="hidden" name="response_type" value="id_token">
      <input type="hidden" name="lti_message_hint">
      <input type="hidden" name="response_mode" value="form_post">
    </form>
    <script type="text/javascript">
      document.ltiAuthForm.lti_message_hint.value = ${JSON.stringify(ltiMessageHint)};
      document.ltiAuthForm.submit();
    </script>
  </body>
</html>
`;
}

export const ltiInitializationSerializer = { serialize };
