import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class Video extends Element {
  static #VALID_HOSTNAME = 'assets.pix.org';

  constructor({ id, title, url, subtitles, transcription, poster }) {
    super({ id, type: 'video' });

    assertNotNullOrUndefined(title, 'The title is required for a video');
    assertNotNullOrUndefined(url, 'The URL is required for a video');
    assertNotNullOrUndefined(subtitles, 'The subtitles are required for a video');
    assertNotNullOrUndefined(transcription, 'The transcription is required for a video');

    if (!URL.canParse(url)) {
      throw new DomainError('The URL must be a valid URL for a video');
    }

    if (subtitles.length > 0 && !URL.canParse(subtitles)) {
      throw new DomainError('The subtitles must be a valid URL for a video');
    }

    this.url = url;
    this.title = title;
    this.subtitles = subtitles;
    this.transcription = transcription;
    this.poster = poster ?? null;

    if (URL.parse(url).hostname !== Video.#VALID_HOSTNAME) {
      throw new DomainError('The video URL must be from "assets.pix.org"');
    }

    if (subtitles.length > 0 && URL.parse(subtitles).hostname !== Video.#VALID_HOSTNAME) {
      throw new DomainError('The subtitles URL must be from "assets.pix.org"');
    }
  }
}

export { Video };
