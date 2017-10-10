export default function getAuthenticatedUser(schema, request) {

  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');

  if (userToken === 'simple-user-token') return schema.users.find(1);

  if (userToken === 'prescriber-user-token') return schema.users.find(2);

  return schema.users.find(3);
}
