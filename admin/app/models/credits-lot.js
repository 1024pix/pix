import Model, { attr } from '@warp-drive/legacy/model';

export default class CreditsLot extends Model {
  @attr('number') count;
  @attr('string') reference;
  @attr('string') activationDate;
  @attr('string') expirationDate;
}
