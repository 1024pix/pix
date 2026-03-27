import Model, { attr, hasMany } from '@ember-data/model';

export default class Module extends Model {
  @attr('string') shortId;
  @attr('string') slug;
  @attr('string') title;
  @attr('boolean') isBeta;
  @attr() details;
  @attr('array') glossary;
  @attr('string') version;
  @attr('string') redirectionUrl;
  @hasMany('section', { async: false, inverse: 'module' }) sections;

  get isNewPattern() {
    return this.sections.length > 1;
  }
}
