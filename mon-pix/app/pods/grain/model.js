import Model, { attr, belongsTo } from '@ember-data/model';

const AVAILABLE_ELEMENT_TYPES = ['text', 'image', 'video', 'qcu', 'qcm', 'qrocm'];

export default class Grain extends Model {
  @attr('string') title;
  @attr({ defaultValue: () => [] }) elements;
  @attr('string') type;

  @belongsTo('module', { async: false, inverse: 'grains' }) module;

  get supportedElements() {
    return this.elements.filter((element) => AVAILABLE_ELEMENT_TYPES.includes(element.type));
  }
}
