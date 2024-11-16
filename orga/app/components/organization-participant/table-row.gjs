import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

//TODO C'est ici le dernier com
import CertificabilityCell from '../certificability/cell';
import DropdownIconTrigger from '../dropdown/icon-trigger';
import DropdownItem from '../dropdown/item';
import LastParticipationDateTooltip from '../ui/last-participation-date-tooltip';

export default class TableRow extends Component {
  @service currentUser;
  @service intl;

  displayDate(date) {
    return dayjs(date).format('DD/MM/YYYY');
  }

  get rowClass() {
    if (this.args.hasOrganizationParticipantPage) {
      return 'tr--clickable';
    }
    return '';
  }

  getExtraColumnRowValue(extraColumnName, participant) {
    const extraColumnValue = participant.extraColumns[extraColumnName];

    if (extraColumnName === 'ORALIZATION') {
      return this.intl.t(`pages.organization-participants.table.row-value.oralization.${extraColumnValue}`);
    }
    if (!extraColumnValue) return '';

    if (dayjs(extraColumnValue).isValid()) {
      return this.displayDate(extraColumnValue);
    }

    return extraColumnValue;
  }

  get extraColumnRowInfo() {
    if (!this.args.participant.extraColumns) {
      return [];
    }

    return Object.keys(this.args.participant.extraColumns).map((extraColumnName) =>
      this.getExtraColumnRowValue(extraColumnName, this.args.participant),
    );
  }

  <template>
    <tr
      aria-label={{t "pages.organization-participants.table.row-title"}}
      {{on "click" @onClickLearner}}
      class={{this.rowClass}}
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
        {{#if @hasOrganizationParticipantPage}}
          <LinkTo @route="authenticated.organization-participants.organization-participant" @model={{@participant.id}}>
            {{@participant.lastName}}
          </LinkTo>
        {{else}}
          {{@participant.lastName}}
        {{/if}}
      </td>
      <td class="ellipsis" title={{@participant.firstName}}>{{@participant.firstName}}</td>
      {{#if @customRows}}
        {{#each this.extraColumnRowInfo as |customCell|}}
          <td>
            {{customCell}}
          </td>
        {{/each}}
      {{/if}}
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

      {{#if (gt @actionsForParticipant.length 0)}}
        <td class="table__column--last-col">
          <DropdownIconTrigger
            @icon="moreVert"
            @dropdownButtonClass="organization-participant-list-page__dropdown-button"
            @dropdownContentClass="organization-participant-list-page__dropdown-content"
            @ariaLabel={{t "pages.sup-organization-participants.actions.show-actions"}}
          >
            <:default as |closeMenu|>
              {{#each @actionsForParticipant as |actionForPartipant|}}
                <DropdownItem @onClick={{actionForPartipant.onClick}} @closeMenu={{closeMenu}}>
                  {{actionForPartipant.label}}
                </DropdownItem>
              {{/each}}
            </:default>
          </DropdownIconTrigger>
        </td>
      {{/if}}
    </tr>
  </template>
}
