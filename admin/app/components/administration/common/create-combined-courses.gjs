import { PixButtonUpload, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';
import { scrollToElement } from 'pix-admin/modifiers/scroll-to';

import AdministrationBlockLayout from '../block-layout';

export default class CreateCombinedCourses extends Component {
  @service intl;
  @service pixToast;
  @service session;
  @service fileSaver;
  @service errorResponseHandler;

  @tracked errors = null;

  @action
  async createCombinedCourses(files) {
    let response;
    this.errors = null;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/combined-courses`, {
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
          message: this.intl.t('components.administration.create-combined-courses.notifications.success'),
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
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.create-combined-courses.title"}}
      @description={{t "components.administration.create-combined-courses.description"}}
      @actionsClass="create-combined-courses__actions"
      class="create-combined-courses"
    >
      <div class="create-combined-courses__buttons">
        <PixButtonUpload
          @id="combined-courses-file-upload"
          @onChange={{this.createCombinedCourses}}
          @variant="primary"
          accept=".csv"
        >
          {{t "components.administration.create-combined-courses.upload-button"}}
        </PixButtonUpload>
      </div>
      {{#if this.errors}}
        <PixNotificationAlert @withIcon={{true}} @type="error" class="create-combined-courses__errors">
          <ul>
            {{#each this.errors as |error|}}
              <li class="create-combined-courses__error" {{scrollToElement}}>
                <span>{{error.detail}}</span>
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
