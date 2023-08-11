import bcrypt from 'bcrypt';

import { config } from '../../config.js';

export const areCredentialsValid = async (username: string, password: string): Promise<boolean> => {
  if (username !== 'pix-api') {
    return false;
  }

  const isPasswordValid = await bcrypt.compare(password, config.pixApiClientSecret);

  if (!isPasswordValid) {
    return false;
  }

  return true;
};
