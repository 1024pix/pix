function serialize() {
  return `<!doctype html>
<html>
  <body>
    Registration successfull, please wait...
    <script>(window.opener ?? window.parent).postMessage({ subject:'org.imsglobal.lti.close' }, '*');</script>
  </body>
</html>
`;
}

export const ltiRegistrationSerializer = { serialize };
