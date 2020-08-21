import { helper } from '@ember/component/helper';

export function decodeToken(accessToken)
{
  const payloadOfToken = accessToken.split('.')[1];
  return JSON.parse(atob(payloadOfToken));
}

export default helper(decodeToken);

