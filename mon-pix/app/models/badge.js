import Model, { attr } from '@warp-drive/legacy/model';

export default class Badge extends Model {
  // attributes
  @attr('string') altMessage;
  @attr('string') message;
  @attr('string') title;
  @attr('string') imageUrl;
  @attr('string') key;
}
