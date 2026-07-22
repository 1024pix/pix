import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import map from 'lodash/map';
import { statusToDisplayName } from 'pix-admin/models/session';

export default class ListItems extends Component {
  @tracked selectedCertificationCenterTypeOption = null;
  @tracked selectedSessionResultsSentToPrescriberOption = null;
  @tracked selectedSessionStatusOption = null;
  @tracked selectedSessionVersionOption = null;

  searchedIds = this.args.ids;
  searchedCertificationCenterName = this.args.certificationCenterName;
  searchedCertificationCenterExternalId = this.args.certificationCenterExternalId;

  constructor() {
    super(...arguments);

    // "certification center type" filter
    this.certificationCenterTypeOptions = [
      { value: 'all', label: 'Tous' },
      { value: 'SCO', label: 'Sco' },
      { value: 'SUP', label: 'Sup' },
      { value: 'PRO', label: 'Pro' },
    ];
    this.selectedCertificationCenterTypeOption = this.getCertificationCenterTypeOptionByValue(
      this.args.certificationCenterType,
    );

    // session status
    this.sessionStatusOptions = [
      { value: 'all', label: 'Tous' },
      ...map(statusToDisplayName, (label, status) => ({ value: status, label })),
    ];
    this.selectedSessionStatusOption = this.getSessionStatusOptionByValue(this.args.sessionStatus);

    // session version
    this.sessionVersionOptions = [
      { value: 'all', label: 'Tous' },
      { value: '2', label: 'Sessions V2' },
      { value: '3', label: 'Sessions V3' },
    ];
    this.selectedSessionVersionOption = this.getSessionVersionOptionByValue();
  }

  @action
  selectCertificationCenterType(newValue) {
    this.selectedCertificationCenterTypeOption = this.getCertificationCenterTypeOptionByValue(newValue);
    this.args.onChangeCertificationCenterType(newValue);
  }

  getCertificationCenterTypeOptionByValue(value) {
    if (value) {
      return find(this.certificationCenterTypeOptions, { value });
    }
    return this.certificationCenterTypeOptions[0];
  }

  @action
  selectSessionStatus(newValue) {
    this.selectedSessionStatusOption = this.getSessionStatusOptionByValue(newValue);
    this.args.onChangeSessionStatus(newValue);
  }

  getSessionStatusOptionByValue(value) {
    if (value) {
      return find(this.sessionStatusOptions, { value });
    }
    return this.sessionStatusOptions[0];
  }

  @action
  selectSessionVersion(newValue) {
    this.selectedSessionVersionOption = this.getSessionVersionOptionByValue(newValue);
    this.args.onChangeSessionVersion(newValue);
  }

  getSessionVersionOptionByValue(value) {
    if (value) {
      return find(this.sessionVersionOptions, { value });
    }
    return this.sessionVersionOptions[0];
  }

  <template>
    <div class="session-list">
      <PixFilterBanner @title={{t "common.filters.title"}}>
        <PixInput
          aria-label={{t "pages.sessions.list.filters.ids.aria-label"}}
          type="text"
          value={{this.searchedIds}}
          oninput={{fn @triggerFiltering "ids"}}
        >
          <:label>{{t "pages.sessions.list.filters.ids.label"}}</:label>
        </PixInput>
        <PixInput
          aria-label={{t "pages.sessions.list.filters.certification-name.aria-label"}}
          type="text"
          value={{this.searchedCertificationCenterName}}
          oninput={{fn @triggerFiltering "certificationCenterName"}}
        >
          <:label>{{t "pages.sessions.table.headers.certification-name"}}</:label>
        </PixInput>
        <PixInput
          aria-label={{t "pages.sessions.list.filters.external-id.aria-label"}}
          type="text"
          value={{this.searchedCertificationCenterExternalId}}
          oninput={{fn @triggerFiltering "certificationCenterExternalId"}}
        >
          <:label>{{t "pages.sessions.table.headers.external-id"}}</:label>
        </PixInput>
        <PixSelect
          @options={{this.certificationCenterTypeOptions}}
          @onChange={{this.selectCertificationCenterType}}
          @value={{@certificationCenterType}}
          @hideDefaultOption={{true}}
          arial-label={{t "pages.sessions.list.filters.type.aria-label"}}
        >
          <:label>{{t "pages.sessions.table.headers.type"}}</:label>
        </PixSelect>
        <PixSelect
          @options={{this.sessionStatusOptions}}
          @onChange={{this.selectSessionStatus}}
          @value={{@status}}
          @hideDefaultOption={{true}}
          aria-label={{t "pages.sessions.list.filters.status.aria-label"}}
        >
          <:label>{{t "pages.sessions.table.headers.status"}}</:label>
        </PixSelect>
        <PixSelect
          @options={{this.sessionVersionOptions}}
          @onChange={{this.selectSessionVersion}}
          @value={{@version}}
          @hideDefaultOption={{true}}
          aria-label={{t "pages.sessions.list.filters.version.aria-label"}}
        >
          <:label>{{t "pages.sessions.list.filters.version.label"}}</:label>
        </PixSelect>
      </PixFilterBanner>

      {{#if @sessions}}
        <PixTable @variant="admin" @data={{@sessions}} @caption={{t "pages.sessions.table.caption"}}>
          <:columns as |session context|>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.id"}}
              </:header>
              <:cell>
                <LinkTo @route="authenticated.sessions.session" @model={{session.id}}>
                  {{session.id}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.certification-name"}}
              </:header>
              <:cell>
                {{session.certificationCenterName}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                {{t "pages.sessions.table.headers.external-id"}}
              </:header>
              <:cell>
                {{session.certificationCenterExternalId}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.type"}}
              </:header>
              <:cell>
                {{#if session.certificationCenterType}}
                  {{session.certificationCenterType}}
                {{else}}
                  -
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.session-date"}}
              </:header>
              <:cell>
                {{#if session.date}}
                  {{formatDate session.date}}
                {{/if}}
                à
                {{session.time}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.status"}}
              </:header>
              <:cell>
                {{session.displayStatus}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.finalization-session-date"}}
              </:header>
              <:cell>
                {{#if session.finalizedAt}}
                  {{formatDate session.finalizedAt}}
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.publication-session-date"}}
              </:header>
              <:cell>
                {{#if session.publishedAt}}
                  {{formatDate session.publishedAt}}
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.version"}}
              </:header>
              <:cell>
                {{session.version}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>

        <PixPagination @pagination={{@sessions.meta}} />
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </div>
  </template>
}
