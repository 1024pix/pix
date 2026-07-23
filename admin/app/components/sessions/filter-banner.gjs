import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import map from 'lodash/map';
import { statusToDisplayName } from 'pix-admin/models/session';

export default class SessionsFilterBanner extends Component {
  searchedIds = this.args.filters?.ids;
  searchedCertificationCenterName = this.args.filters?.certificationCenterName;
  searchedCertificationCenterExternalId = this.args.filters?.certificationCenterExternalId;

  constructor() {
    super(...arguments);

    this.certificationCenterTypeOptions = [
      { value: 'all', label: 'Tous' },
      { value: 'SCO', label: 'Sco' },
      { value: 'SUP', label: 'Sup' },
      { value: 'PRO', label: 'Pro' },
    ];

    this.sessionStatusOptions = [
      { value: 'all', label: 'Tous' },
      ...map(statusToDisplayName, (label, status) => ({ value: status, label })),
    ];

    this.sessionVersionOptions = [
      { value: 'all', label: 'Tous' },
      { value: '2', label: 'Sessions V2' },
      { value: '3', label: 'Sessions V3' },
    ];
  }

  <template>
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
        @onChange={{fn @onChangeFilter "certificationCenterType"}}
        @value={{@filters.certificationCenterType}}
        @hideDefaultOption={{true}}
        aria-label={{t "pages.sessions.list.filters.type.aria-label"}}
      >
        <:label>{{t "pages.sessions.table.headers.type"}}</:label>
      </PixSelect>
      <PixSelect
        @options={{this.sessionStatusOptions}}
        @onChange={{fn @onChangeFilter "status"}}
        @value={{@filters.status}}
        @hideDefaultOption={{true}}
        aria-label={{t "pages.sessions.list.filters.status.aria-label"}}
      >
        <:label>{{t "pages.sessions.table.headers.status"}}</:label>
      </PixSelect>
      <PixSelect
        @options={{this.sessionVersionOptions}}
        @onChange={{fn @onChangeFilter "version"}}
        @value={{@filters.version}}
        @hideDefaultOption={{true}}
        aria-label={{t "pages.sessions.list.filters.version.aria-label"}}
      >
        <:label>{{t "pages.sessions.list.filters.version.label"}}</:label>
      </PixSelect>
    </PixFilterBanner>
  </template>
}
