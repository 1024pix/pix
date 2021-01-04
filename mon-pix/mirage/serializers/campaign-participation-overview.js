import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'createdAt',
    'isShared',
    'sharedAt',
    'organizationName',
    'assessmentState',
    'campaignCode',
    'campaignTitle',
  ],
});
