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
      this.resultTrigger = response.content.jobs[0];
    } catch (error) {
      this.resultTrigger = String(error);
    }
  };

  triggerTaskWithError = async () => {
    try {
      const response = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/admin/experiment/trigger?error=true`,
        method: 'POST',
      });
      this.resultTrigger = response.content.jobs[0];
    } catch (error) {
      this.resultTrigger = String(error);
    }
  };

  monitorTask = async () => {
    try {
      const response = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/admin/experiment/monitor/${this.resultTrigger}`,
        method: 'GET',
      });
      this.resultMonitor = response.content[0].state + ' : ' + JSON.stringify(response.content[0].output, null, 2);
    } catch (error) {
      this.resultMonitor = String(error);
    }
  };

  <template>
    <h2>Ça marche on est des pros!</h2>
    <PixButton @triggerAction={{this.triggerTask}}>Déclencher</PixButton>
    <PixButton @triggerAction={{this.triggerTaskWithError}}>Déclencher mais en mieux</PixButton>

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
