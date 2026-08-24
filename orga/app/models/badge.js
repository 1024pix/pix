import Model, { attr } from '@warp-drive/legacy/model';

export default class Badge extends Model {
  @attr('string') title;
  @attr('string') imageUrl;
  @attr('string') altMessage;
  @attr('boolean') acquired;
}
