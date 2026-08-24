import Model, { attr } from '@warp-drive/legacy/model';

export default class CertifiedTube extends Model {
  @attr('string') name;
  @attr('string') competenceId;
}
