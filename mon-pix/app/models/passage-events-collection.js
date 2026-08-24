import Model, { attr } from '@warp-drive/legacy/model';

export default class PassageEventsCollection extends Model {
  @attr('array') events;
}
