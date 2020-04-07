import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class ChallengePreviewRoute extends Route {
  model(params) {
    const store = this.store;
    return store.findRecord('challenge', params.challenge_id);
  }

  afterModel(challenge) {
    const store = this.store;

    const assessment = store.createRecord('assessment', { type: 'PREVIEW' });

    return assessment.save().then(() => {
      return this.replaceWith('assessments.challenge', assessment.id, challenge.id);
    });
  }
}
