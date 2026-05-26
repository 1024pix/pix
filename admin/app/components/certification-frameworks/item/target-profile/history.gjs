import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

export default class TargetProfilesHistory extends Component {
  @service router;

  @action
  viewTargetProfile(id) {
    this.router.transitionTo('authenticated.target-profiles.target-profile', id);
  }

  <template>
    <section class="page-section framework-target-profiles-history">
      <PixAccordions>
        <:title>
          {{t "components.certification-frameworks.target-profiles.history-list.title"}}
        </:title>
        <:content>
          <PixTable
            @variant="admin"
            @data={{@targetProfilesHistory}}
            @caption={{t "components.certification-frameworks.target-profiles.history-list.caption"}}
          >
            <:columns as |row targetProfileHistory|>
              <PixTableColumn @context={{targetProfileHistory}}>
                <:header>
                  {{t "components.certification-frameworks.target-profiles.history-list.headers.name"}}
                </:header>
                <:cell>
                  {{row.name}}
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{targetProfileHistory}}>
                <:header>
                  <PixIcon @name="calendar" @ariaHidden={{true}} />
                  {{t "components.certification-frameworks.target-profiles.history-list.headers.attached-at"}}
                </:header>
                <:cell>
                  <strong>{{formatDate row.attachedAt}}</strong>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{targetProfileHistory}}>
                <:header>
                  <PixIcon @name="calendar" @ariaHidden={{true}} />
                  {{t "components.certification-frameworks.target-profiles.history-list.headers.detached-at"}}
                </:header>
                <:cell>
                  <strong>{{if row.detachedAt (formatDate row.detachedAt) "-"}}</strong>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{targetProfileHistory}}>
                <:header>
                  {{t "components.certification-frameworks.target-profiles.history-list.headers.actions"}}
                </:header>
                <:cell>
                  <PixIconButton
                    @triggerAction={{fn this.viewTargetProfile row.id}}
                    @ariaLabel={{t "components.certification-frameworks.target-profiles.history-list.actions.view"}}
                    @iconName="eye"
                  />
                </:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        </:content>
      </PixAccordions>
    </section>
  </template>
}
