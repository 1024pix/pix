import { expect } from 'chai';

import { ltiDeepLinkingSerializer } from '../../../../../../src/lti/infrastructure/serializers/html/lti-deep-linking-serializer.js';

describe('Unit | LTI | Infrastructure | Serializer | HTML | lti-deep-linking', function () {
  it('returns an HTML page auto submitting deep linking response to LTI platform', function () {
    // given
    const deepLinkingResponse = 'deepLinkingResponseToken';
    const deepLinkingReturnUrl = 'https://moodle.net';

    // when
    const html = ltiDeepLinkingSerializer.serialize({ deepLinkingReturnUrl, deepLinkingResponse });

    // then
    expect(html).to.deep.equal(`<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAuthForm" name="ltiAuthForm" action="${deepLinkingReturnUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${deepLinkingResponse}">
    </form>
    <script type="text/javascript">
      document.ltiAuthForm.submit();
    </script>
  </body>
</html>
`);
  });
});
