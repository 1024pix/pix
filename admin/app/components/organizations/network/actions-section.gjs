import { PixButtonLink } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AttachChildForm from './attach-child-form';

export default class ActionsSection extends Component {
  @service accessControl;

  <template>
    <section class="page-section">
      <div class="content-text content-text--small organization-network__actions-section">
        {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
          <PixButtonLink
            @iconBefore="add"
            @variant="secondary"
            @route="authenticated.organizations.new"
            @query={{hash parentOrganizationId=@organization.id parentOrganizationName=@organization.name}}
          >{{t "components.organizations.network.create-child-organization-button"}}</PixButtonLink>
        {{/if}}

        {{#if this.accessControl.hasAccessToAttachChildOrganizationActionsScope}}
          <AttachChildForm @onFormSubmitted={{@onAttachChildSubmitForm}} />
        {{/if}}
      </div>
    </section>
  </template>
}
