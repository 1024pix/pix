import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Video extends Element {
  @attr('string') title;
  @attr('string') url;
  @attr('string') subtitles;
  @attr('string') transcription;
  @attr('string') alternativeText;

  get hasAlternativeText() {
    return this.alternativeText.length > 0;
  }
}

export { Video };
