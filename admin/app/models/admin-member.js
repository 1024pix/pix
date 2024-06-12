import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@ember-data/model';

export default class AdminMember extends Model {
  @attr() userId;
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') email;
  @attr('string') role;
  @attr('string') updatedRole;
  @attr('string') disabledAt;
  @attr() isSuperAdmin;
  @attr() isCertif;
  @attr() isSupport;
  @attr() isMetier;

  @attr('boolean') isInEditionMode;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  deactivate = memberAction({
    path: 'deactivate',
    type: 'put',
    urlType: 'updateRecord',
    after() {
      this.unloadRecord();
    },
  });
}
