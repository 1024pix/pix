import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Qrocm extends Element {
  @attr('string') instruction;
  @attr() proposals;
}
