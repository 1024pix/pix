import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: [
    'challenge',
  ],
  links(answer) {
    return {
      'correction': {
        related: `/api/answers/${answer.id}/correction`
      },
    };
  }
});
