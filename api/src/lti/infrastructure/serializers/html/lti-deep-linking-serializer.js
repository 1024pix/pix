import { Buffer } from 'node:buffer';

async function serialize({ deepLinkingReturnUrl, deepLinkingResponse }) {
  const scriptSrc = 'document.ltiAutoSubmitForm.submit();';

  const payload = `<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAutoSubmitForm" name="ltiAutoSubmitForm" action="${deepLinkingReturnUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${deepLinkingResponse}">
    </form>
    <script>${scriptSrc}</script>
  </body>
</html>
`;

  const scriptSrcHash = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(scriptSrc));
  const scriptSrcBase64Hash = Buffer.from(scriptSrcHash).toString('base64');
  // FIXME starting with node25, replace with:
  // const scriptSrcBase64Hash = new Uint8Array(scriptSrcHash).toBase64();
  const scriptSrcDirective = `script-src 'sha512-${scriptSrcBase64Hash}';`;
  return { payload, scriptSrcDirective };
}

export const ltiDeepLinkingSerializer = { serialize };
