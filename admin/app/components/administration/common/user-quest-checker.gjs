import { PixButton, PixInput, PixTag } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';

export default class UserQuestChecker extends Component {
  @tracked userId;
  @tracked questId;
  @tracked canBeSuccessful;
  @service session;
  @service intl;

  @action
  onQuestIdChange(event) {
    this.questId = event.target.value;
  }

  @action
  onUserIdChange(event) {
    this.userId = event.target.value;
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    const response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/check-user-quest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.session.data.authenticated.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            'user-id': this.userId,
            'quest-id': this.questId,
          },
        },
      }),
    });

    const json = await response.json();
    this.canBeSuccessful =
      json.data.attributes['is-successful'] === true
        ? this.intl.t('components.administration.user-quest-checker.messages.success')
        : this.intl.t('components.administration.user-quest-checker.messages.error');
    this.tagColor = json.data.attributes['is-successful'] === true ? 'green' : 'primary';
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.user-quest-checker.title"}}
      @description={{t "components.administration.user-quest-checker.description"}}
    >
      <form class="user-quest-checker__form" {{on "submit" this.onSubmit}}>
        <PixInput value={{this.userId}} {{on "change" this.onUserIdChange}}>
          <:label>{{t "components.administration.user-quest-checker.form.user-id-input-label"}}</:label>
        </PixInput>
        <PixInput value={{this.questId}} {{on "change" this.onQuestIdChange}}>
          <:label>{{t "components.administration.user-quest-checker.form.quest-id-input-label"}}</:label>
        </PixInput>
        <PixButton @type="submit">
          {{t "components.administration.user-quest-checker.form.submit-button"}}
        </PixButton>
        {{#if this.canBeSuccessful}}
          <PixTag @color={{this.tagColor}}>{{this.canBeSuccessful}}</PixTag>
        {{/if}}
      </form>
    </AdministrationBlockLayout>
  </template>
}
