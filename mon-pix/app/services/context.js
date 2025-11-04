import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ContextService extends Service {
  @service requestManager;

  // frontendContext;

  // async load() {
  //   this.frontendContext = await this.store.queryRecord('frontend-context', { id: 0 });
  // }

  allo() {
    console.log('ALLO')
  }
  // async fetch() {
  //   const response = await this.requestManager.request({
  //     url: `${ENV.APP.API_HOST}/api/context`,
  //     method: 'GET',
  //   });
  //   return response.content;
  // }
}
