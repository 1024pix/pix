import { helper } from '@ember/component/helper';
import { jwtDecode } from 'jwt-decode';

export function decodeToken(accessToken) {
  return jwtDecode(accessToken);
}

export default helper(decodeToken);
