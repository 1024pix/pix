import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'pixScore',
  ],
  include: ['scorecards', 'areas'],
});
