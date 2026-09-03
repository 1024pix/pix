import { jwtDecode, type JwtPayload } from 'jwt-decode';

export function decodeToken(accessToken: string): JwtPayload & Record<string, unknown> {
  return jwtDecode<JwtPayload & Record<string, unknown>>(accessToken);
}
