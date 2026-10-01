import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

export default class extends Component {
  @service session;
  @service fileSaver;

  @action
  async downloadTemplate() {
    try {
      const url = ENV.APP.API_HOST + this.args.url;
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, token });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: error.message });
    }
  }

  <template>
    <div class="csv-import" ...attributes>
      {{yield}}
      <PixButton @triggerAction={{this.downloadTemplate}} @variant="tertiary">
        <PixIcon @name="download" @plainIcon={{true}} @ariaHidden={{true}} />
        {{t "common.actions.download-template"}}
      </PixButton>
    </div>
  </template>
}
