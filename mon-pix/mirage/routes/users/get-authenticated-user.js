export default function getAuthenticatedUser(schema, request) {

  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

  return schema.users.find(userId);
}
