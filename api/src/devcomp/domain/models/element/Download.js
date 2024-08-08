import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.js';

class Download extends Element {
  constructor({ id, files }) {
    super({ id, type: 'download' });

    this.#assertFilesIsAnArray(files);
    this.#assertFilesAreNotEmpty(files);

    files.forEach((file) => {
      assertNotNullOrUndefined(file.url, 'The Download files should have an URL');
      assertNotNullOrUndefined(file.format, 'The Download files should have a format');
    });

    this.files = files;
  }

  #assertFilesIsAnArray(files) {
    if (!Array.isArray(files)) {
      throw new Error('The Download files should be a list');
    }
  }

  #assertFilesAreNotEmpty(files) {
    if (files.length === 0) throw new Error('The files are required for a Download');
  }
}

export { Download };
