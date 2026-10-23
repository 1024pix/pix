import ApplicationAdapter from './application';

export default class LtiCampaignAdapter extends ApplicationAdapter {
  urlForFindAll() {
    return 'api/lti/campaigns';
  }
}
