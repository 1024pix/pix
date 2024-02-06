import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Image extends Element {
  @attr('string') url;
  @attr('string') alt;
  @attr('string') alternativeText;

  get hasAlternativeText() {
    return this.alternativeText.length > 0;
  }
}
