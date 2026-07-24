import Model, { attr } from '@warp-drive/legacy/model';

export const categoriesKey = {
  ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
  OTHER: 'OTHER',
  QUESTION_ISSUE: 'QUESTION_ISSUE',
  RESPONSE_ISSUE: 'RESPONSE_ISSUE',
  IMPROVEMENT: 'IMPROVEMENT',
  INSTRUCTION_ISSUE: 'INSTRUCTION_ISSUE',
  EMBED_NOT_WORKING: 'EMBED_NOT_WORKING',
};

export default class ModuleIssueReport extends Model {
  @attr('string') moduleId;
  @attr('string') elementId;
  @attr('string') passageId;
  @attr('string') answer;
  @attr('string') categoryKey;
  @attr('string') comment;
}
