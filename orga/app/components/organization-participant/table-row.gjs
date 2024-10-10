import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { t } from 'ember-intl';

import CertificabilityCell from '../certificability/cell';
import LastParticipationDateTooltip from '../ui/last-participation-date-tooltip';

export default class TableRow extends Component {
  @service currentUser;

  displayDate(date) {
    return dayjs(date).format('DD/MM/YYYY');
  }

  getCustomRowData(extraColumns, key) {
    const data = extraColumns[key];

    if (!data) return '';

    if (dayjs(data).isValid()) {
      return this.displayDate(data);
    } else {
      return data;
    }
  }

  <template>
    <tr
      aria-label={{t "pages.organization-participants.table.row-title"}}
      {{on "click" @onClickLearner}}
      class="tr--clickable"
    >
      {{#if @showCheckbox}}
        <td class="table__column" {{on "click" @onToggleParticipant}}>
          <PixCheckbox @screenReaderOnly={{true}} @checked={{@isParticipantSelected}}>
            <:label>
              {{t
                "pages.organization-participants.table.column.checkbox"
                firstname=@participant.firstName
                lastname=@participant.lastName
              }}
            </:label>
          </PixCheckbox>
        </td>
      {{/if}}
      <td class="table__column">
        <LinkTo @route="authenticated.organization-participants.organization-participant" @model={{@participant.id}}>
          {{@participant.lastName}}
        </LinkTo>
      </td>
      <td class="ellipsis" title={{@participant.firstName}}>{{@participant.firstName}}</td>
      {{#each @customRows as |key|}}
        <td>{{this.getCustomRowData @participant.extraColumns key}}</td>
      {{/each}}
      {{#unless this.currentUser.canAccessMissionsPage}}
        <td class="table__column--center">
          {{@participant.participationCount}}
        </td>
        <td>
          <div class="organization-participant-list-page__last-participation">
            {{#if @participant.lastParticipationDate}}
              <span>{{this.displayDate @participant.lastParticipationDate}}</span>
              <LastParticipationDateTooltip
                @id={{@participant.id}}
                @campaignName={{@participant.campaignName}}
                @campaignType={{@participant.campaignType}}
                @participationStatus={{@participant.participationStatus}}
              />
            {{/if}}
          </div>
        </td>
        <td class="table__column--center">
          <CertificabilityCell
            @certifiableAt={{@participant.certifiableAt}}
            @isCertifiable={{@participant.isCertifiable}}
            @hideCertifiableDate={{@hideCertifiableDate}}
          />
        </td>
      {{/unless}}
    </tr>
  </template>
}
