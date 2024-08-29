import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

export default class ParticipationRow extends Component {
  @service notifications;
  @service accessControl;

  @tracked isEditionMode = false;
  @tracked newParticipantExternalId;

  constructor() {
    super(...arguments);
  }

  _checkIfParticipantExternalIdIsNull(newParticipantExternalId) {
    const trimedNewParticipantExternalId = newParticipantExternalId.trim();
    return trimedNewParticipantExternalId || null;
  }

  @action
  updateParticipantExternalId() {
    this.isEditionMode = false;
    this.args.participation.participantExternalId = this._checkIfParticipantExternalIdIsNull(
      this.newParticipantExternalId,
    );
    return this.args.updateParticipantExternalId(this.args.participation);
  }

  @action
  cancelUpdateParticipantExternalId() {
    this.isEditionMode = false;
    this.newParticipantExternalId = null;
  }

  @action
  editParticipantExternalId() {
    this.isEditionMode = true;
    this.newParticipantExternalId = null;
  }

  @action
  handleChange(e) {
    this.newParticipantExternalId = e.target.value;
  }

  <template>
    <td>{{@participation.firstName}} {{@participation.lastName}}</td>
    <td>
      <LinkTo @route="authenticated.users.get" @model={{@participation.userId}}>
        {{@participation.userFullName}}
      </LinkTo>
    </td>
    {{#if @idPixLabel}}
      <td class="table__column table__column--break-word">
        {{#if this.isEditionMode}}
          <PixInput
            type="text"
            @id="participantExternalId"
            @screenReaderOnly={{true}}
            value={{@participation.participantExternalId}}
            onchange={{this.handleChange}}
            class="table-admin-input form-control"
          >
            <:label>Modifier l'identifiant externe du participant</:label>
          </PixInput>
        {{else}}
          {{@participation.participantExternalId}}
        {{/if}}
      </td>
    {{/if}}
    <td>{{dayjsFormat @participation.createdAt "DD/MM/YYYY"}}</td>
    <td>{{@participation.displayedStatus}}</td>
    <td>
      {{if @participation.sharedAt (dayjsFormat @participation.sharedAt "DD/MM/YYYY") "-"}}
    </td>
    {{#if @participation.deletedAt}}
      <td>
        {{dayjsFormat @participation.deletedAt "DD/MM/YYYY"}}
        par
        <LinkTo @route="authenticated.users.get" @model={{@participation.deletedBy}}>
          {{@participation.deletedByFullName}}
        </LinkTo>
      </td>
    {{else}}
      <td>-</td>
    {{/if}}
    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
      {{#if @idPixLabel}}
        <td>
          <div class="participation-item-actions">
            {{#if this.isEditionMode}}
              <div class="participation-item-actions__modify">
                <PixButton
                  @size="small"
                  @triggerAction={{this.updateParticipantExternalId}}
                  class="participation-item-actions__button participation-item-actions__button--save"
                >
                  {{t "common.actions.save"}}
                </PixButton>
                <PixButton
                  @size="small"
                  @variant="secondary"
                  @triggerAction={{this.cancelUpdateParticipantExternalId}}
                  aria-label={{t "common.actions.cancel"}}
                  class="participation-item-actions__button--icon"
                >
                  <FaIcon @icon="xmark" />
                </PixButton>
              </div>
            {{else}}
              <PixButton
                @triggerAction={{this.editParticipantExternalId}}
                @size="small"
                class="participation-item-actions__button"
                @iconBefore="pen-to-square"
              >
                {{t "common.actions.edit"}}
              </PixButton>
            {{/if}}
          </div>
        </td>
      {{/if}}
    {{/if}}
  </template>
}
