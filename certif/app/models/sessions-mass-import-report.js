import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class SessionsMassImportReportModel extends Model {
  @attr('string') cachedValidatedSessionsKey;

  confirm = memberAction({
    type: 'post',
    urlType: 'confirm-mass-import',
    before(attributes) {
      return {
        data: {
          attributes,
        },
      };
    },
  });
}
