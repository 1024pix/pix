import { expect } from 'chai';

import { ltiDeepLinkingSerializer } from '../../../../../../src/lti/infrastructure/serializers/html/lti-deep-linking-serializer.js';

describe('Unit | LTI | Infrastructure | Serializer | HTML | lti-deep-linking', function () {
  it('returns an HTML page auto submitting deep linking response to LTI platform', async function () {
    // given
    const deepLinkingResponse = 'deepLinkingResponseToken';
    const deepLinkingReturnUrl = 'https://moodle.net';

    // generated with:
    // echo -n 'document.ltiAuthForm.submit();' | sha512sum | cut -w -f1 | xxd -r -p | base64
    const expectedScriptSrcHash =
      '+7VL2CPKHRCVHrzCvMPrHOPSgQUEKALj4vtgm2wTyhEddM+zYZTlUJSPRTtjlXJGLKtCvU1WqowLp7Vdc3bUpg==';

    // when
    const { payload, scriptSrcDirective } = await ltiDeepLinkingSerializer.serialize({
      deepLinkingReturnUrl,
      deepLinkingResponse,
    });

    // then
    expect(payload).to.deep.equal(`<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAuthForm" name="ltiAuthForm" action="${deepLinkingReturnUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${deepLinkingResponse}">
    </form>
    <script>document.ltiAuthForm.submit();</script>
  </body>
</html>
`);
    expect(scriptSrcDirective).to.equal(`script-src 'sha512-${expectedScriptSrcHash}';`);
  });
});
