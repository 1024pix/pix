import { PixButton } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class Experimentation extends Component {
  @service requestManager;

  @tracked resultTrigger;
  @tracked resultMonitor;

  triggerTask = async () => {
    try {
      const response = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/admin/experiment/trigger`,
        method: 'POST',
      });
      this.resultTrigger = JSON.stringify(response.content);
    } catch (error) {
      this.resultTrigger = String(error);
    }
  };

  monitorTask = async () => {
    try {
      const response = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/admin/experiment/monitor`,
        method: 'GET',
      });
      this.resultMonitor = JSON.stringify(response.content);
    } catch (error) {
      this.resultMonitor = String(error);
    }
  };

  <template>
    <h2>Ça marche on est des pros!</h2>
    <PixButton @triggerAction={{this.triggerTask}}>Déclencher</PixButton>

    <pre>
      <code>
        {{this.resultTrigger}}
      </code>
    </pre>

    <h2>On en est où ?</h2>
    <PixButton @triggerAction={{this.monitorTask}}>Tu en es où ?</PixButton>

    <pre>
      <code>
        {{this.resultMonitor}}
      </code>
    </pre>
  </template>
}
