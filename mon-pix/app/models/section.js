import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export const SECTION_TITLE_ICONS = {
  'question-yourself': 'doorOpen',
  'explore-to-understand': 'signpost',
  'retain-the-essentials': 'lightBulb',
  practise: 'think',
  'go-further': 'mountain',
};

export default class Section extends Model {
  @attr('string') type;
  @attr({ defaultValue: () => [] }) grains;

  @belongsTo('module', { async: false, inverse: 'sections' }) module;
}
