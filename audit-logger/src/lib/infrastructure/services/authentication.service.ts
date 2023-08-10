import bcrypt from 'bcrypt';

import { config } from '../../config.js';

export const validate = async (username: string, password: string): Promise<object> => {
  if (username !== 'pix-api') {
    return { isValid: false, credentials: null };
  }

  const isPasswordValid = await bcrypt.compare(password, config.pixApiClientSecret);

  if (!isPasswordValid) {
    return { isValid: false, credentials: null };
  }

  return { isValid: true, credentials: {} };
};
