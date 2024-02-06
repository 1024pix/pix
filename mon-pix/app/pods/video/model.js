import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Video extends Element {
  @attr('string') title;
  @attr('string') url;
  @attr('string') subtitles;
  @attr('string') transcription;

  get hasTranscription() {
    return this.transcription.length > 0;
  }
}

export { Video };
