import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Video extends Element {
  constructor({ id, title, url, subtitles, transcription }) {
    super({ id, type: 'video' });

    assertNotNullOrUndefined(title, 'The title is required for a video');
    assertNotNullOrUndefined(url, 'The URL is required for a video');
    assertNotNullOrUndefined(subtitles, 'The subtitles are required for a video');
    assertNotNullOrUndefined(transcription, 'The transcription is required for a video');

    this.url = url;
    this.title = title;
    this.subtitles = subtitles;
    this.transcription = transcription;
  }
}

export { Video };
