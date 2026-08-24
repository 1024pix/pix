import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';
import Location from 'mon-pix/utils/location';

export default class DownloadSessionResults extends Component {
  @tracked errorMessage = null;
  @service fileSaver;
  @service intl;

  @action
  async downloadSessionResults(event) {
    event.preventDefault();
    this.errorMessage = null;

    try {
      const { hash } = new URL(Location.getHref());
      const token = decodeURIComponent(hash.slice(1));
      await this.fileSaver.save({
        url: `${ENV.APP.API_HOST}/api/sessions/download-all-results`,
        options: {
          method: 'POST',
          body: { token },
        },
      });
    } catch (error) {
      if (error.code === 'INVALID_SESSION_RESULT_TOKEN') {
        this.errorMessage = this.intl.t('pages.download-session-results.errors.invalid-token');
      } else {
        this.errorMessage = this.intl.t('common.error');
      }
    }
  }

  <template>
    <PixBlock class="download-session-results">
      <form class="download-session-results__form" autocomplete="off">

        <h1 class="form__title">
          {{t "pages.download-session-results.title"}}
        </h1>

        <PixButton
          @type="submit"
          @triggerAction={{this.downloadSessionResults}}
          @size="large"
          @iconBefore="download"
          class="form__actions"
        >
          {{t "pages.download-session-results.button.label"}}
        </PixButton>

        {{#if this.errorMessage}}
          <PixNotificationAlert @type="error" class="form__error">
            {{this.errorMessage}}
          </PixNotificationAlert>
        {{/if}}
      </form>
    </PixBlock>
  </template>
}
