import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class UpsertQuestsInBatch extends Component {
  @service intl;
  @service pixToast;
  @service session;
  @service fileSaver;
  @service errorResponseHandler;

  @action
  async upsertQuestsInBatch(files) {
    let response;
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
        this.errorResponseHandler.notify(await response.json());
      }
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.upsert-quests-in-batch.title"}}
      @description={{t "components.administration.upsert-quests-in-batch.description"}}
    >
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
    </AdministrationBlockLayout>
  </template>
}
