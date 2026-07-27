import Model, { attr } from '@warp-drive/legacy/model';

export default class InvigilatorAuthentication extends Model {
  @attr('string') sessionId;
  @attr('string') invigilatorPassword;
}
