import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Qcu extends Element {
  @attr('string') instruction;
  @attr() proposals;
}
