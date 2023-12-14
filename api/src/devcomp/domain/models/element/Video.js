import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Video extends Element {
  constructor({ id, title, url, subtitles, transcription, alternativeText }) {
    super({ id, type: 'video' });

    assertNotNullOrUndefined(url, "L'URL est obligatoire pour un video");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un video');
    assertNotNullOrUndefined(subtitles, 'Les sous-titres sont obligatoire pour un video');
    assertNotNullOrUndefined(transcription, 'Les transcriptions sont obligatoire pour un video');
    assertNotNullOrUndefined(alternativeText, "L'instruction alternative est obligatoire pour un video");

    this.url = url;
    this.title = title;
    this.subtitles = subtitles;
    this.transcription = transcription;
    this.alternativeText = alternativeText;
  }
}

export { Video };
