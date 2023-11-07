import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import path from 'path';

class ConfigLoader {
  #configDirectoryPath;
  #configuration;

  constructor({ configDirectoryPath }) {
    this.#configDirectoryPath = configDirectoryPath;
  }

  async loadConfigFile() {
    const profile = process.env.NODE_ENV;
    const buffer = await fs.readFile(this.#configFilePath({ profile }));
    this.#configuration = dotenv.parse(buffer);
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
