import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import TickOrCross from '../../common/tick-or-cross';

export default class Stage extends Component {
  @tracked showModal = false;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  get isZeroStageAmongOtherStages() {
    return (
      ((this.args.stage.isTypeLevel && this.args.stage.level === 0) ||
        (!this.args.stage.isTypeLevel && this.args.stage.threshold === 0)) &&
      this.args.collectionHasNonZeroStages
    );
  }

  get canDeleteStage() {
    return !this.isZeroStageAmongOtherStages && !this.args.hasLinkedCampaign;
  }

  <template>
    <tr aria-label="Informations sur le palier {{@stage.title}}">
      <td>
        {{#if @stage.isFirstSkill}}
          1er acquis
        {{else if @stage.isTypeLevel}}
          {{@stage.level}}
        {{else}}
          {{@stage.threshold}}%
        {{/if}}
      </td>
      <td>{{@stage.title}}</td>
      <td>{{@stage.message}}</td>
      <td>
        <TickOrCross @isTrue={{@stage.hasPrescriberTitle}} />
      </td>
      <td>
        <TickOrCross @isTrue={{@stage.hasPrescriberDescription}} />
      </td>
      <td>
        <PixButtonLink
          @variant="secondary"
          @route="authenticated.target-profiles.target-profile.stages.stage"
          @size="small"
          @model={{@stage.id}}
          aria-label="Voir le détail du palier {{@stage.id}}"
        >
          Voir détail
        </PixButtonLink>
        {{#if this.canDeleteStage}}
          <PixButton
            @variant="error"
            @size="small"
            @iconBefore="trash"
            @triggerAction={{this.toggleModal}}
            aria-label="Supprimer le palier {{@stage.id}}"
            class="stages-table-actions-delete"
          >
            Supprimer
          </PixButton>
          <PixModal
            @title="Confirmer la suppression"
            @showModal={{this.showModal}}
            @onCloseButtonClick={{this.toggleModal}}
          >
            <:content>
              <p>
                Êtes-vous sûr de vouloir supprimer le
                {{#if @stage.isTypeLevel}}
                  niveau
                  {{@stage.level}}
                {{else}}
                  seuil
                  {{@stage.threshold}}
                {{/if}}
                <b>{{@stage.title}} </b>?
              </p>
            </:content>
            <:footer>
              <PixButton @variant="secondary" @triggerAction={{this.toggleModal}}>
                {{t "common.actions.cancel"}}
              </PixButton>
              <PixButton @variant="error" @triggerAction={{fn @deleteStage @stage}}>
                {{t "common.actions.validate"}}
              </PixButton>
            </:footer>
          </PixModal>
        {{/if}}
      </td>
    </tr>
  </template>
}
