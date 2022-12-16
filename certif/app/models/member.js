import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class Member extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') isReferer;

  updateReferer = memberAction({
    type: 'post',
    urlType: 'update-referer',
    before({ userId, isReferer }) {
      return {
        data: {
          attributes: {
            userId,
            isReferer,
          },
        },
      };
    },
  });
}
