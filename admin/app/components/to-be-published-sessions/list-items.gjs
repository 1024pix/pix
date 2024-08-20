import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ConfirmPopup from '../confirm-popup';

export default class ToBePublishedSessionsList extends Component {
  @service accessControl;

  @tracked shouldShowModal = false;
  currentSelectedSession;

  _cancelModalSelection() {
    this.shouldShowModal = false;
    this.currentSelectedSession = null;
  }

  @action
  showConfirmModal(currentSelectedSession) {
    this.shouldShowModal = true;
    this.currentSelectedSession = currentSelectedSession;
  }

  @action
  hideConfirmModal() {
    this._cancelModalSelection();
  }

  @action
  publishSession() {
    this.args.publishSession(this.currentSelectedSession);
    this._cancelModalSelection();
  }
  <template>
    <div class="content-text content-text--small table-admin__wrapper session-list">
      <table class="table-admin table-admin__auto-width">
        <thead>
          <tr>
            <th class="table__column table__column--id">ID</th>
            <th>Centre de certification</th>
            <th>Date de session</th>
            <th>Date de finalisation</th>
            {{#if this.accessControl.hasAccessToCertificationActionsScope}}
              <th>Actions</th>
            {{/if}}
          </tr>
        </thead>

        {{#if @toBePublishedSessions}}
          <tbody>
            {{#each @toBePublishedSessions as |toBePublishedSession|}}
              <tr>
                <td class="table__column table__column--id">
                  <LinkTo @route="authenticated.sessions.session" @model={{toBePublishedSession.id}}>
                    {{toBePublishedSession.id}}
                  </LinkTo>
                </td>
                <td>{{toBePublishedSession.certificationCenterName}}</td>
                <td>{{toBePublishedSession.printableDateAndTime}}</td>
                <td>{{toBePublishedSession.printableFinalizationDate}}</td>
                {{#if this.accessControl.hasAccessToCertificationActionsScope}}
                  <td>
                    <PixButton
                      @triggerAction={{fn this.showConfirmModal toBePublishedSession}}
                      class="publish-session-button"
                      @size="small"
                      aria-label="Publier la session numéro {{toBePublishedSession.id}}"
                      @iconBefore="paper-plane"
                    >
                      Publier
                    </PixButton>
                  </td>
                {{/if}}
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @toBePublishedSessions}}
        <div class="table__empty">Aucun résultat</div>
      {{/unless}}
    </div>

    <ConfirmPopup
      @message="Souhaitez-vous publier la session ?"
      @confirm={{this.publishSession}}
      @cancel={{this.hideConfirmModal}}
      @show={{this.shouldShowModal}}
    />
  </template>
}
