import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

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
    return this.#configuration[key];
  }

  #configFilePath({ profile }) {
    return `${this.#configDirectoryPath}/${profile}.env`;
  }
}

export { ConfigLoader };
