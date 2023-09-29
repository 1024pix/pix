import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class CertificationCenterInvitation extends Model {
  @attr('string') email;
  @attr('string') status;
  @attr('date') updatedAt;
  @attr('string') certificationCenterName;

  accept = memberAction({
    path: 'accept',
    type: 'post',
    urlType: 'saveRecord',
    before({ id, code, email }) {
      return {
        data: {
          id,
          type: 'certification-center-invitations-accept',
          attributes: {
            code,
            email,
          },
        },
      };
    },
  });
}
