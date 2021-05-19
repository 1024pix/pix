import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  redirect(challenge, transition) {
    const newLevel = transition.to.queryParams.newLevel || null;
    const competenceLeveled = transition.to.queryParams.competenceLeveled || null;
    const assessmentId = transition.to.parent.params.assessment_id;
    return this.replaceWith('assessments.challenge', assessmentId, { queryParams: { newLevel: newLevel, competenceLeveled: competenceLeveled } });
  }
}
