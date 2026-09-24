function serialize() {
  return `<!DOCTYPE html>
<html>
  <body>
    Registration successfull, please wait...
    <script type="text/javascript">
      (window.opener ?? window.parent).postMessage({ subject:'org.imsglobal.lti.close' }, '*');
    </script>
  </body>
</html>
`;
}

export const ltiRegistrationSerializer = { serialize };
