import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import map from 'lodash/map';
import { statusToDisplayName } from 'pix-admin/models/session';

import formatDate from '../../helpers/format-date';

export default class ListItems extends Component {
  @tracked selectedCertificationCenterTypeOption = null;
  @tracked selectedSessionResultsSentToPrescriberOption = null;
  @tracked selectedSessionStatusOption = null;
  @tracked selectedSessionVersionOption = null;

  searchedId = this.args.id;
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
    <div class="content-text content-text--small table-admin__wrapper session-list">
      <table class="table-admin table-admin__auto-width">
        <thead>
          <tr>
            <th class="table__column table__column--id" id="session-id">ID</th>
            <th id="certification-center-name">Centre de certification</th>
            <th id="session-external-id">Identifiant externe</th>
            <th id="certification-center-category">Catégorie</th>
            <th id="session-date">Date de session</th>
            <th id="session-status">Statut</th>
            <th id="session-finalization-date">Date de finalisation</th>
            <th id="session-publication-date">Date de publication</th>
            <th id="session-version">Version de la session</th>
          </tr>
          <tr>
            <td class="table__column table__column--id">
              <PixInput
                aria-label="Filtrer les sessions avec un id"
                type="text"
                value={{this.searchedId}}
                oninput={{fn @triggerFiltering "id"}}
              />
            </td>
            <td>
              <PixInput
                aria-label="Filtrer les sessions avec le nom d'un centre de certification"
                type="text"
                value={{this.searchedCertificationCenterName}}
                oninput={{fn @triggerFiltering "certificationCenterName"}}
              />
            </td>
            <td>
              <PixInput
                aria-label="Filtrer les sessions avec un identifiant externe"
                type="text"
                value={{this.searchedCertificationCenterExternalId}}
                oninput={{fn @triggerFiltering "certificationCenterExternalId"}}
              />
            </td>
            <td>
              <PixSelect
                @screenReaderOnly={{true}}
                class="sessions-list-items__select"
                @options={{this.certificationCenterTypeOptions}}
                @onChange={{this.selectCertificationCenterType}}
                @value={{@certificationCenterType}}
              >
                <:label>Filtrer les sessions en sélectionnant un type de centre de certification</:label>
              </PixSelect>
            </td>
            <td></td>
            <td>
              <PixSelect
                @screenReaderOnly={{true}}
                class="sessions-list-items__select"
                @options={{this.sessionStatusOptions}}
                @onChange={{this.selectSessionStatus}}
                @value={{@status}}
              >
                <:label>Filtrer les sessions en sélectionnant un statut</:label>
              </PixSelect>
            </td>
            <td></td>
            <td></td>
            <td>
              <PixSelect
                @screenReaderOnly={{true}}
                class="sessions-list-items__select"
                @options={{this.sessionVersionOptions}}
                @onChange={{this.selectSessionVersion}}
                @value={{@version}}
              >
                <:label>Filtrer les sessions par leur version</:label>
              </PixSelect>
            </td>
          </tr>
        </thead>

        {{#if @sessions}}
          <tbody>
            {{#each @sessions as |session|}}
              <tr aria-label="Informations de la session de certification {{session.id}}">
                <td headers="session-id" class="table__column table__column--id">
                  <LinkTo @route="authenticated.sessions.session" @model={{session.id}}>
                    {{session.id}}
                  </LinkTo>
                </td>
                <td headers="certification-center-name">{{session.certificationCenterName}}</td>
                <td headers="session-external-id">{{session.certificationCenterExternalId}}</td>
                {{#if session.certificationCenterType}}
                  <td headers="certification-center-category" class="session-list__item--align-center">
                    {{session.certificationCenterType}}
                  </td>
                {{else}}
                  <td headers="certification-center-category" class="session-list__item--align-center">-</td>
                {{/if}}
                <td headers="session-date">{{formatDate session.date}} à {{session.time}}</td>
                <td headers="session-status">{{session.displayStatus}}</td>
                <td headers="session-finalization-date">{{formatDate session.finalizedAt}}</td>
                <td headers="session-publication-date">{{formatDate session.publishedAt}}</td>
                <td headers="session-version">{{session.version}}</td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @sessions}}
        <div class="table__empty">Aucun résultat</div>
      {{/unless}}
    </div>

    {{#if @sessions}}
      <PixPagination @pagination={{@sessions.meta}} />
    {{/if}}
  </template>
}
