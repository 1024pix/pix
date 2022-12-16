import { helper } from '@ember/component/helper';
import jwt_decode from 'jwt-decode';

export function decodeToken(accessToken) {
  return jwt_decode(accessToken);
}

export default helper(decodeToken);
