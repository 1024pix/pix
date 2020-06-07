import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'altMessage',
    'imageUrl',
    'message',
    'key',
    'isAcquired',
  ],
  include: [
    'partnerCompetenceResults',
  ],
});
