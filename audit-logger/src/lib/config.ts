import * as url from 'node:url';

import { type LevelWithSilent } from 'pino';

type BooleanType = 'false' | 'true';
type Environment = 'development' | 'test' | 'production';
type Configuration = {
  environment: Environment;
  logging: {
    enabled: boolean;
    logLevel: LevelWithSilent;
    logForHumans: boolean;
  };
  port: number;
  pixApiClientSecret: string;
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
      idleTimeoutMillis: number;
    };
    asyncStackTraces: boolean;
  };
};

let isEnvLoaded = false;

// Load environment variables from .env files
if (!isEnvLoaded) {
  try {
    if (process.env.NODE_ENV === 'test') {
      try {
        process.loadEnvFile(url.fileURLToPath(new URL('../../tests/setup/.env.test.local', import.meta.url)));
      } catch {
        // no .env.test.local overrides
      }
      process.loadEnvFile(url.fileURLToPath(new URL('../../tests/setup/.env.test', import.meta.url)));
    } else {
      process.loadEnvFile(url.fileURLToPath(new URL('../../.env', import.meta.url)));
    }
  } catch {
    // .env file not found, continuing without it
  } finally {
    // eslint-disable-next-line no-useless-assignment
    isEnvLoaded = true;
  }
}

export const config: Configuration = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  logging: {
    enabled: _isFeatureEnabled(process.env.LOG_ENABLED as BooleanType),
    logLevel: (process.env.LOG_LEVEL as LevelWithSilent) || 'info',
    logForHumans: _getLogForHumans(),
  },
  port: parseInt(process.env.PORT as string, 10) || 3001,
  pixApiClientSecret: process.env.PIX_API_CLIENT_SECRET as string,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres@localhost/pix_audit_logging',
    pool: {
      min: parseInt(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE as string, 10) || 1,
      max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE as string, 10) || 4,
      idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS as string, 10) || 10_000,
    },
    asyncStackTraces: process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
  },
};

if (config.pixApiClientSecret === undefined) {
  throw new Error('Environment variable PIX_API_CLIENT_SECRET must be defined');
}

function _getLogForHumans(): boolean {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';

  return processOutputingToTerminal && !forceJSONLogs;
}

function _isFeatureEnabled(environmentVariable: BooleanType): boolean {
  return environmentVariable === 'true';
}
