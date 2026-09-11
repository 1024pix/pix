import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, or } from 'ember-truth-helpers';

export default class  extends Component {
  @tracked role;

  setRole() {
    this.role = this.args.member.role;
  }

  @action
  toggleRole() {
    if(!this.role) {
      this.setRole();
    }
    if (this.role === 'MEMBER') {
      this.role = 'ADMIN';
    } else {
      this.role = 'MEMBER';
    }
  }

  @action
  closeModal() {
    this.setRole();
    this.args.onClose();
  }

  <template>
    <PixModal
      @title={{t 'pages.team.members.modals.change-member-role.title'}}
      @showModal={{@isOpen}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <p>
          {{t
            'pages.team.members.modals.change-member-role.information'
            firstName=@member.firstName
            lastName=@member.lastName
          }}
        </p>

        <PixCheckbox @variant='primary' {{on 'click' this.toggleRole}} @checked={{eq (or this.role @member.role) 'ADMIN'}}>
          <:label>{{t 'pages.team.members.modals.change-member-role.admin'}}</:label>
        </PixCheckbox>
      </:content>
      <:footer>
        <PixButton @triggerAction={{this.closeModal}} @variant='secondary' @isBorderVisible={{true}}>
          {{t 'common.actions.cancel'}}
        </PixButton>
        <PixButton
          id='save-certification-center-role'
          @triggerAction={{fn @onSubmit this.role}}
          @size='small'
          aria-label={{t 'pages.team.members.actions.save'}}
        >
          {{t 'pages.team.members.actions.save'}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
