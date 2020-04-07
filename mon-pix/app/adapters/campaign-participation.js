import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class CampaignParticipation extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.beginImprovement) {
      delete adapterOptions.beginImprovement;
      return url + '/begin-improvement';
    }
    return url;
  }
}

