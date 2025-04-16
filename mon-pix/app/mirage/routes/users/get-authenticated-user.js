import { decodeToken } from 'mon-pix/helpers/jwt';

export default function getAuthenticatedUser(schema, request) {
  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  const userId = decodeToken(userToken).user_id;

  return schema.users.find(userId);
}
