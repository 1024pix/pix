import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger.js';

class ConfigLoader {
  #configDirectoryPath;
  #configuration;

  constructor({ configDirectoryPath }) {
    this.#configDirectoryPath = configDirectoryPath;
  }

  async loadConfigFile() {
    try {
      const profile = process.env.NODE_ENV;
      const buffer = await fs.readFile(this.#configFilePath({ profile }));
      this.#configuration = dotenv.parse(buffer);
    } catch (error) {
      this.#configuration = {};
      logger.info('Could not load the configuration file');
    }
  }

  get(key) {
    if (process.env[key]) {
      return process.env[key];
    }

    if (this.#configuration[key]) {
      return this.#configuration[key];
    }

    return undefined;
  }

  #configFilePath({ profile }) {
    return path.join(this.#configDirectoryPath, `${profile}.env`);
  }
}

export { ConfigLoader };
