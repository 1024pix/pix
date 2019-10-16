import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['code', 'invitationId'],
  code: null,
  invitationId: null,
});
