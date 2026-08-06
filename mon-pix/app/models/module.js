import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Module extends Model {
  @attr('string') shortId;
  @attr('string') slug;
  @attr('string') title;
  @attr('boolean') isBeta;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() details;
  @attr('string') version;
  @attr('string') redirectionUrl;
  @hasMany('section', { async: false, inverse: 'module' }) sections;

  get isNewPattern() {
    return this.sections.length > 1;
  }
}
