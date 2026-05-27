import { usecases } from '../domain/usecases/index.js';

export async function checkIfUserIsBlocked(request, h) {
  const { username, grant_type: grantType, data } = request.payload;

  let emailOrUsername;

  if (grantType === 'password') {
    emailOrUsername = username;
  } else if (data?.attributes?.username) {
    emailOrUsername = data.attributes.username;
  } else if (data?.attributes?.email) {
    emailOrUsername = data.attributes.email;
  }

  if (emailOrUsername) {
    await usecases.assertUserIsBlocked({ emailOrUsername });
  }
  return h.response(true);
}
