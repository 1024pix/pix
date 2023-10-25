import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Lesson extends Element {
  @attr('string') content;
}
