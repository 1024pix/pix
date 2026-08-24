import Model, { attr } from '@warp-drive/legacy/model';

export default class CertifiedArea extends Model {
  @attr('string') name;
  @attr('string') color;
}
