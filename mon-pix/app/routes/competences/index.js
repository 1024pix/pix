import Route from '@ember/routing/route';

export default class CompetencesIndexRoute extends Route {

  beforeModel(params) {
    return this.replaceWith('competences.details', params.competence_id);
  }

}
