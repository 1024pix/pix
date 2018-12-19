export default function getAuthenticatedUser(schema, request) {

  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');

  if (userToken === 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUyMTg5MDh9.bbbb') return schema.users.find(1);

  if (userToken === 'aaa.eyJ1c2VyX2lkIjoyLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUyMTg4Nzl9.bbbb') return schema.users.find(2);

  return schema.users.find(3);
}
