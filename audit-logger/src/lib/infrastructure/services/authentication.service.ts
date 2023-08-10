import { config } from '../../config.js';

export const validate = (username: string, password: string): object => {
  if (username !== 'pix-api') {
    return { isValid: false, credentials: null };
  }

  if (password !== config.pixApiClientSecret) {
    return { isValid: false, credentials: null };
  }

  return { isValid: true, credentials: {} };
};
