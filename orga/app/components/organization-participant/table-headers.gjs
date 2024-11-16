import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';

import { getColumnName } from '../../helpers/import-format.js';
import Tooltip from '../certificability/tooltip';
import Header from '../table/header';
import HeaderSort from '../table/header-sort';

export default class TableHeaders extends Component {
  @service currentUser;

  <template>
    <tr>
      {{#if @showCheckbox}}
        <Header class="table__column--small">
          <PixCheckbox
            @screenReaderOnly={{true}}
            @checked={{@someSelected}}
            @isIndeterminate={{not @allSelected}}
            disabled={{not @hasParticipants}}
            {{on "click" @onToggleAll}}
          ><:label>{{t "pages.organization-participants.table.column.mainCheckbox"}}</:label></PixCheckbox>
        </Header>
      {{/if}}
      <HeaderSort
        @display="left"
        @onSort={{@onSortByLastname}}
        @order={{@lastnameSort}}
        @ariaLabelDefaultSort={{t "pages.organization-participants.table.column.last-name.ariaLabelDefaultSort"}}
        @ariaLabelSortUp={{t "pages.organization-participants.table.column.last-name.ariaLabelSortUp"}}
        @ariaLabelSortDown={{t "pages.organization-participants.table.column.last-name.ariaLabelSortDown"}}
      >
        {{t "pages.organization-participants.table.column.last-name.label"}}
      </HeaderSort>
      <Header>{{t "pages.organization-participants.table.column.first-name"}}</Header>
      {{#each @customHeadings as |heading|}}
        <Header>
          <div class="organization-participant-list-page__header-with-tooltip">
            {{t (getColumnName heading)}}
            {{#if (eq heading "ORALIZATION")}}
              <PixTooltip @id="organization-participants-oralization-tooltip" @isWide="true">
                <:triggerElement>
                  <PixIcon
                    @name="help"
                    @plainIcon="true"
                    aria-label={{t "pages.organization-participants.table.oralization-header-tooltip-aria-label"}}
                    aria-describedby="organization-participants-oralization-tooltip"
                  />
                </:triggerElement>

                <:tooltip>
                  {{t "pages.organization-participants.table.oralization-header-tooltip"}}
                </:tooltip>
              </PixTooltip>
            {{/if}}

          </div>
        </Header>
      {{/each}}

      {{#unless this.currentUser.canAccessMissionsPage}}
        <HeaderSort
          @size="medium"
          @align="center"
          @onSort={{@onSortByParticipationCount}}
          @order={{@participationCountOrder}}
          @ariaLabelDefaultSort={{t
            "pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort"
          }}
          @ariaLabelSortUp={{t "pages.organization-participants.table.column.participation-count.ariaLabelSortUp"}}
          @ariaLabelSortDown={{t "pages.organization-participants.table.column.participation-count.ariaLabelSortDown"}}
        >
          {{t "pages.organization-participants.table.column.participation-count.label"}}
        </HeaderSort>
        <HeaderSort
          @size="medium"
          @align="center"
          @onSort={{@onSortByLatestParticipation}}
          @order={{@latestParticipationOrder}}
          @ariaLabelDefaultSort={{t
            "pages.organization-participants.table.column.latest-participation.ariaLabelDefaultSort"
          }}
          @ariaLabelSortUp={{t "pages.organization-participants.table.column.latest-participation.ariaLabelSortUp"}}
          @ariaLabelSortDown={{t "pages.organization-participants.table.column.latest-participation.ariaLabelSortDown"}}
        >
          {{t "pages.organization-participants.table.column.latest-participation.label"}}
        </HeaderSort>
        <Header @size="medium" @align="center">
          <div class="organization-participant-list-page__certificability-header">
            {{t "pages.organization-participants.table.column.is-certifiable.label"}}
            <Tooltip
              @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
            />
          </div>
        </Header>
      {{/unless}}

      {{#if @hasActionColumn}}
        <Header @size="small" class="table__column--last-col">
          {{t "common.actions.global"}}
        </Header>
      {{/if}}
    </tr>
  </template>
}
