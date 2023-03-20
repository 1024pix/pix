import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  async model(params) {
    return params.challenge_number;
  }
}
