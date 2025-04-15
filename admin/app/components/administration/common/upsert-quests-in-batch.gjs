import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';
import { scrollToElement } from 'pix-admin/modifiers/scroll-to';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class UpsertQuestsInBatch extends Component {
  @service intl;
  @service pixToast;
  @service session;
  @service fileSaver;
  @service errorResponseHandler;

  @tracked errors = null;

  @action
  async upsertQuestsInBatch(files) {
    let response;
    this.errors = null;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/quests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: fileContent,
      });
      if (response.ok) {
        this.pixToast.sendSuccessNotification({
          message: this.intl.t('components.administration.upsert-quests-in-batch.notifications.success'),
        });
        return;
      } else {
        const responseJson = await response.json();
        const { errors: responseErrors } = responseJson;
        if (isJSONAPIError(responseErrors)) {
          this.errors = responseErrors;
        } else {
          this.errorResponseHandler.notify(responseJson, undefined, true);
        }
      }
    } catch (err) {
      console.error(err);
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.upsert-quests-in-batch.title"}}
      @description={{t "components.administration.upsert-quests-in-batch.description"}}
      @actionsClass="upsert-quests-in-batch__actions"
      class="upsert-quests-in-batch"
    >
      <div class="upsert-quests-in-batch__buttons">
        <DownloadTemplate @url="/api/admin/quests/template">
          <PixButtonUpload
            @id="quests-batch-update-file-upload"
            @onChange={{this.upsertQuestsInBatch}}
            @variant="primary"
            accept=".csv"
          >
            {{t "components.administration.upsert-quests-in-batch.upload-button"}}
          </PixButtonUpload>
        </DownloadTemplate>

        <PixButtonLink @iconBefore="cogsMagic" @route="authenticated.quest-creator" @variant="secondary">
          {{t "components.administration.upsert-quests-in-batch.quest-creator"}}
        </PixButtonLink>
      </div>
      {{#if this.errors}}
        <PixNotificationAlert @withIcon={{true}} @type="error" class="upsert-quests-in-batch__errors">
          <ul>
            {{#each this.errors as |error|}}
              <li class="upsert-quests-in-batch__error" {{scrollToElement}}>
                <span>{{error.detail}}</span>
                <pre class="upsert-quests-in-batch__json">{{transformMetaToJSON error}}</pre>
              </li>
            {{/each}}
          </ul>
        </PixNotificationAlert>
      {{/if}}
    </AdministrationBlockLayout>
  </template>
}

function isEmpty(value) {
  return Array.isArray(value) && value.length === 0;
}

function isJSONAPIError(errors) {
  return !isEmpty(errors) && errors.every((error) => error.title);
}

function transformMetaToJSON(error) {
  if (!error.meta.data) return '';
  return JSON.stringify(error.meta.data, undefined, 2);
}
