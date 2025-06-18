import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixToggleButton from '@1024pix/pix-ui/components/pix-toggle-button';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import LinkToCurrentTargetProfile from '../common/link-to-current-target-profile';

export default class Information extends Component {
  @service currentUser;

  get isMultipleCurrentTargetProfiles() {
    return this.args.complementaryCertification?.currentTargetProfiles?.length > 1;
  }

  get hasAccessToAttachNewTargetProfile() {
    return this.currentUser.adminMember.isSuperAdmin;
  }

  <template>
    <section class="page-section">
      <div class="content-text content-text--small complementary-certification-details">
        {{#if @currentTargetProfile}}
          <LinkToCurrentTargetProfile @model={{@currentTargetProfile}} />
        {{/if}}
        {{#if this.isMultipleCurrentTargetProfiles}}
          <PixToggleButton @toggled={{@switchToggle}} @onChange={{@switchTargetProfile}} @screenReaderOnly={{true}}>
            <:label>Accéder aux détails des profils cibles courants</:label>
            <:viewA>Profil 1</:viewA>
            <:viewB>Profil 2</:viewB>
          </PixToggleButton>
        {{/if}}
        {{#if this.hasAccessToAttachNewTargetProfile}}
          <div class="complementary-certification-details-target-profile__attach-button">
            {{#if @currentTargetProfile}}
              <PixButtonLink
                @route="authenticated.complementary-certifications.complementary-certification.attach-target-profile.update"
                @model={{@currentTargetProfile.id}}
              >Rattacher un nouveau profil cible
              </PixButtonLink>
            {{else}}
              <PixButtonLink
                @route="authenticated.complementary-certifications.complementary-certification.attach-target-profile.new"
              >Rattacher un profil cible
              </PixButtonLink>
            {{/if}}
          </div>
        {{/if}}
      </div>
    </section>
  </template>
}
