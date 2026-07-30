import Model, { hasMany } from '@warp-drive/legacy/model';

export default class InformationBanner extends Model {
  @hasMany('banner', { async: false, inverse: null }) banners;
}
