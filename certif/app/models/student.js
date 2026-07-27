import Model, { attr } from '@warp-drive/legacy/model';

export default class StudentModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') division;
  @attr('boolean', { defaultValue: false }) isSelected;
  @attr('boolean', { defaultValue: false }) isEnrolled;

  setSelected(newState) {
    if (this.isEnrolled) {
      return;
    }

    this.isSelected = newState;
  }
}
