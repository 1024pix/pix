import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'pixScore',
    'sharedAt',
  ],
  include: ['scorecards', 'areas'],
});
