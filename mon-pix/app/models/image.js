import Model, { attr } from '@ember-data/model';

export default class ImageModel extends Model {
  @attr() b64FormattedImage;
}
