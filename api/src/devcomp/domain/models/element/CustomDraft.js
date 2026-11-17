import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class CustomDraft extends Element {
  static #VALID_URL_PREFIX = {
    ATELIER_CONTENUS: 'https://1024pix.github.io/atelier-contenus',
    PIX_EPREUVES_EXTERNES: 'https://1024pix.github.io/pix-epreuves-externes',
  };

  constructor({ id, title, url, instruction, height }) {
    super({ id, type: 'custom-draft' });

    assertNotNullOrUndefined(title, 'The title is required for a custom-draft');
    assertNotNullOrUndefined(url, 'The URL is required for a custom-draft');
    if (!URL.canParse(url)) {
      throw new DomainError('The URL must be a valid URL for a custom-draft');
    }

    assertNotNullOrUndefined(height, 'The height is required for an embed');

    this.title = title;
    this.url = url;
    this.instruction = instruction;
    this.height = height;

    if (
      !URL.parse(url).href.startsWith(CustomDraft.#VALID_URL_PREFIX.ATELIER_CONTENUS) &&
      !URL.parse(url).href.startsWith(CustomDraft.#VALID_URL_PREFIX.PIX_EPREUVES_EXTERNES)
    ) {
      throw new DomainError(
        'The custom-draft URL must be from "1024pix.github.io/atelier-contenus" or "1024pix.github.io/pix-epreuves-externes"',
      );
    }
  }
}

export { CustomDraft };
