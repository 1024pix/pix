import Model, { attr } from '@ember-data/model';

export default class InfoChallenge extends Model {
  @attr() type;
  @attr() solution;
  @attr() pixValue;
  @attr() skillIds;
  @attr() skillNames;
  @attr() tubeIds;
  @attr() tubeNames;
  @attr() competenceIds;
  @attr() competenceNames;
  @attr() areaIds;
  @attr() areaNames;
}
