import Model, { attr } from '@warp-drive/legacy/model';

export default class CertifiedCompetence extends Model {
  @attr('string') name;
  @attr('string') areaId;
  @attr('string') origin;
}
