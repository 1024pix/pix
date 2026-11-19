function serialize({ deepLinkingReturnUrl, deepLinkingResponse }) {
  return `<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAutoSubmitForm" name="ltiAutoSubmitForm" action="${deepLinkingReturnUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${deepLinkingResponse}">
    </form>
    <script>document.ltiAutoSubmitForm.submit();</script>
  </body>
</html>
`;
}

export const ltiDeepLinkingSerializer = { serialize };
