function serialize({ deepLinkUrl, jwtResponse }) {
  return `<!DOCTYPE html>
<html>
  <body>
    <form id="ltiAuthForm" name="ltiAuthForm" action="${deepLinkUrl}" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="JWT" value="${jwtResponse}">
    </form>
    <script type="text/javascript">
      document.ltiAuthForm.submit();
    </script>
  </body>
</html>
`;
}

export const ltiDeepLinkingSerializer = { serialize };
