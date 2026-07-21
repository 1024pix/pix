import Model, { attr } from '@warp-drive/legacy/model';

export default class Assessment extends Model {
  @attr('string') state;
  @attr('string') missionId;
  @attr('string') organizationLearnerId;
  @attr result;
}
