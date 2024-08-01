import * as dotenv from 'dotenv';
import { type LevelWithSilent } from 'pino';

dotenv.config();

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
};

const config: Configuration = {
  environment: (process.env.NODE_ENV as Environment) || 'development',
  logging: {
    enabled: _isFeatureEnabled(process.env.LOG_ENABLED as BooleanType),
    logLevel: (process.env.LOG_LEVEL as LevelWithSilent) || 'info',
    logForHumans: _getLogForHumans(),
  },
  port: parseInt(process.env.PORT as string, 10) || 3001,
  pixApiClientSecret: process.env.PIX_API_CLIENT_SECRET as string,
};

switch (config.environment) {
  case 'development':
    config.logging.enabled = true;
    break;
  case 'test':
    config.logging.enabled = _isBooleanFeatureEnabledElseDefault(process.env.TEST_LOG_ENABLED as BooleanType, false);
    break;
}

if (config.pixApiClientSecret === undefined) {
  throw new Error('Environment variable PIX_API_CLIENT_SECRET must be defined');
}

export { config };

function _getLogForHumans(): boolean {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';

  return processOutputingToTerminal && !forceJSONLogs;
}

function _isFeatureEnabled(environmentVariable: BooleanType): boolean {
  return environmentVariable === 'true';
}

function _isBooleanFeatureEnabledElseDefault(environmentVariable: BooleanType, defaultValue: boolean): boolean {
  return environmentVariable === 'true' ? true : defaultValue;
}
