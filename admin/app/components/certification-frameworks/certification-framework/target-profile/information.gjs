import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import LinkToCurrentTargetProfile from '../../common/link-to-current-target-profile';

export default class Information extends Component {
  @service currentUser;

  get hasAccessToAttachNewTargetProfile() {
    return this.currentUser.adminMember.isSuperAdmin;
  }

  <template>
    <section class="page-section">
      <div class="content-text content-text--small certification-framework-details">
        {{#if @currentTargetProfile}}
          <LinkToCurrentTargetProfile @model={{@currentTargetProfile}} />
        {{/if}}
        {{#if this.hasAccessToAttachNewTargetProfile}}
          <div class="certification-framework-details-target-profile__attach-button">
            {{#if @currentTargetProfile}}
              <PixButtonLink
                @route="authenticated.certification-frameworks.certification-framework.target-profile.update"
                @model={{@currentTargetProfile.id}}
              >Rattacher un nouveau profil cible
              </PixButtonLink>
            {{else}}
              <PixButtonLink
                @route="authenticated.certification-frameworks.certification-framework.target-profile.new"
              >Rattacher un profil cible
              </PixButtonLink>
            {{/if}}
          </div>
        {{/if}}
      </div>
    </section>
  </template>
}
