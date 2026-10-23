import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class ShortVideo extends Element {
  static #VALID_HOSTNAME = 'assets.pix.org';

  constructor({ id, title, url, transcription }) {
    super({ id, type: 'short-video' });

    assertNotNullOrUndefined(title, 'The title is required for a short video');
    assertNotNullOrUndefined(url, 'The URL is required for a short video');

    if (!URL.canParse(url)) {
      throw new DomainError('The URL must be a valid URL for a short video');
    }

    this.url = url;
    this.title = title;
    this.transcription = transcription;

    if (URL.parse(url).hostname !== ShortVideo.#VALID_HOSTNAME) {
      throw new DomainError('The short video URL must be from "assets.pix.org"');
    }
  }
}

export { ShortVideo };
