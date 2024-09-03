import ApplicationAdapter from './application';

export default class Passage extends ApplicationAdapter {
  async terminate({ passageId }) {
    const url = `${this.host}/${this.namespace}/passages/${passageId}/terminate`;
    await this.ajax(url, 'POST');
  }
}
