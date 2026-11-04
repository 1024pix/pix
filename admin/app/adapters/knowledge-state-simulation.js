import ApplicationAdapter from './application';

export default class KnowledgeStateSimulationAdapter extends ApplicationAdapter {
  simulate(knowledgeElements) {
    const url = `${this.host}/${this.namespace}/knowledge-states/simulations`;
    return this.ajax(url, 'POST', { data: { data: { knowledgeElements } } });
  }
}
