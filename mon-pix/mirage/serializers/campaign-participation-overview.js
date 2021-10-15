import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: ['campaignTitle', 'campaignCode', 'status', 'organizationName', 'createdAt', 'isShared', 'sharedAt'],
});
