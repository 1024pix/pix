import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Campaign extends Model {

  // attributes
  @attr('string') code;
  @attr('string') idPixLabel;
  @attr('string') title;
  @attr('date') archivedAt;
  @attr('string') organizationLogoUrl;
  @attr('string') organizationName;
  @attr('string') customLandingPageText;
  @attr('boolean') isRestricted;

  // includes
  @belongsTo('targetProfile') targetProfile;

  @computed('archivedAt')
  get isArchived() {
    return Boolean(this.archivedAt);
  }
}
