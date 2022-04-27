import path from 'path';
import {
  declareMissingClassPropertiesPlugin,
  eslintFixPlugin,
  explicitAnyPlugin,
  tsIgnorePlugin,
  stripTSIgnorePlugin,
} from 'ts-migrate-plugins';
import { migrate, MigrateConfig } from 'ts-migrate-server';

async function migrateClassesToTypescript(): Promise<void> {
  // get input files folder
  const inputDir = path.resolve(__dirname, 'lib/domain/models');

  // create new migration config and add ts-ignore plugin with empty options
  const config = new MigrateConfig().addPlugin(declareMissingClassPropertiesPlugin, {});
  config.addPlugin(eslintFixPlugin, {});
  config.addPlugin(explicitAnyPlugin, {});
  config.addPlugin(tsIgnorePlugin, {});
  config.addPlugin(eslintFixPlugin, {});
  config.addPlugin(stripTSIgnorePlugin, {});

  // run migration
  const exitCode = await migrate({ rootDir: inputDir, config });

  process.exit(exitCode);
}

migrateClassesToTypescript();
