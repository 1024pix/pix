import Model, { attr } from '@warp-drive/legacy/model';

export default class School extends Model {
  @attr name;
  @attr code;
  @attr organizationLearners;
}
