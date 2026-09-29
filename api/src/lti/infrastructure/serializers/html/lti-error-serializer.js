function serialize({ title, message }) {
  return `<!DOCTYPE html>
<html>
  <body>
    <h1>${title}</h1>
    <p>${message}</p>
  </body>
</html>
`;
}

export const ltiErrorSerializer = { serialize };
