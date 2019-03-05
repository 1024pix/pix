import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    const user = this.store.createRecord('user', {
      firstName: 'Prénom',
      lastName: 'Nom',
    });
    return this.store.createRecord('campaignParticipation', {
      isShared: true,
      participantExternalId: 'mel@test.fr',
      createdAt: '27/02/1989',
      progression: 100,
      user:user
    });
  },
});
