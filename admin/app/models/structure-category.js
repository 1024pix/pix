import Model, { attr } from '@warp-drive/legacy/model';

export default class StructureCategory extends Model {
  @attr('string') label;
}
