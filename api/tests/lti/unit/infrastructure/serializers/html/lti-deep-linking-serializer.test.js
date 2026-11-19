import { expect } from 'chai';

import { ltiDeepLinkingSerializer } from '../../../../../../src/lti/infrastructure/serializers/html/lti-deep-linking-serializer.js';

describe('Unit | LTI | Infrastructure | Serializer | HTML | lti-deep-linking', function () {
  it('returns an HTML page auto submitting deep linking response to LTI platform', async function () {
    // given
    const deepLinkingResponse = 'deepLinkingResponseToken';
    const deepLinkingReturnUrl = 'https://moodle.net';

    // generated with:
    // echo -n 'document.ltiAutoSubmitForm.submit();' | sha512sum | cut -w -f1 | xxd -r -p | base64
    const expectedScriptSrcHash =
      'ROsB5iBQpNrTh1y4rZU1xDG2Iac4HgLlL5r1Ey3JxgoWI3f0WNJNvGpBvMarzbqDbz0E11bLUO6qRy5ZwvgeRQ==';

    // when
    const { payload, scriptSrcDirective } = await ltiDeepLinkingSerializer.serialize({
      deepLinkingReturnUrl,
      deepLinkingResponse,
    });

    // then
    expect(payload).to.deep.equal(`<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAutoSubmitForm" name="ltiAutoSubmitForm" action="${deepLinkingReturnUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${deepLinkingResponse}">
    </form>
    <script>document.ltiAutoSubmitForm.submit();</script>
  </body>
</html>
`);
    expect(scriptSrcDirective).to.equal(`script-src 'sha512-${expectedScriptSrcHash}';`);
  });
});
