import { decodeToken } from 'mon-pix/helpers/jwt';

export default function getMyAccount(schema, request) {
  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  const userId = decodeToken(userToken).user_id;

  const user = schema.users.find(userId);
  if (!user.accountInfo) {
    return schema.accountInfos.create({
      email: user.email,
      username: user.username,
      canSelfDeleteAccount: false,
    });
  }

  return user.accountInfo;
}
