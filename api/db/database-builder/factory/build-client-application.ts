import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.ts';

const DEFAULT_CLIENT_SECRET = 'super-secret';
// eslint-disable-next-line n/no-sync
const DEFAULT_CLIENT_SECRET_HASH = cryptoService.hashPasswordSync(DEFAULT_CLIENT_SECRET);

type ClientApplicationAttributes = {
  id?: number;
  name?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  jurisdiction?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const getHashedSecret = (clientSecret: string): string => {
  if (clientSecret === DEFAULT_CLIENT_SECRET) {
    return DEFAULT_CLIENT_SECRET_HASH;
  }
  // eslint-disable-next-line n/no-sync
  return cryptoService.hashPasswordSync(clientSecret);
};

const buildClientApplication = ({
  id = databaseBuffer.getNextId(),
  name = 'clientApplication',
  clientId = 'client-id',
  clientSecret = DEFAULT_CLIENT_SECRET,
  scopes = ['scope1', 'scope2'],
  jurisdiction = { rules: [{ name: 'tags', value: ['MEDNUM'] }] },
  createdAt = new Date(),
  updatedAt = new Date(),
}: ClientApplicationAttributes = {}) => {
  return databaseBuffer.pushInsertable({
    tableName: 'client_applications',
    values: {
      id,
      name,
      clientId,
      clientSecret: getHashedSecret(clientSecret),
      scopes,
      jurisdiction,
      createdAt,
      updatedAt,
    },
  });
};

export { buildClientApplication };
