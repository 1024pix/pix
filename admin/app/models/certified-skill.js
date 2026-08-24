import Model, { attr } from '@warp-drive/legacy/model';

export default class CertifiedSkill extends Model {
  @attr('string') name;
  @attr('string') tubeId;
  @attr('boolean') hasBeenAskedInCertif;
  @attr('number') difficulty;
}
