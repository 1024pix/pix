import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class Audio extends Element {
  static #VALID_HOSTNAME = 'assets.pix.org';

  constructor({ id, title, url, transcription }) {
    super({ id, type: 'audio' });

    assertNotNullOrUndefined(title, 'The title is required for an audio');
    assertNotNullOrUndefined(url, 'The URL is required for an audio');
    assertNotNullOrUndefined(transcription, 'The transcription is required for an audio');

    if (!URL.canParse(url)) {
      throw new DomainError('The URL must be a valid URL for an audio');
    }

    if (URL.parse(url).hostname !== Audio.#VALID_HOSTNAME) {
      throw new DomainError('The audio URL must be from "assets.pix.org"');
    }
    this.url = url;
    this.title = title;
    this.transcription = transcription;
  }
}

export { Audio };
