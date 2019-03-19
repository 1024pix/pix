import BaseSerializer from './application';

export default BaseSerializer.extend({
  include: ['competences', 'organizations'],
  links(user) {
    return {
      pixScore: {
        related: `/users/${user.id}/pixscore`
      },
      scorecards: {
        related: `/users/${user.id}/scorecards`
      }
    };
  }
});
