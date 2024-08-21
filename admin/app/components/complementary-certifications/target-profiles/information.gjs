import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixToggle from '@1024pix/pix-ui/components/pix-toggle';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import LinkToCurrentTargetProfile from '../common/link-to-current-target-profile';

export default class Information extends Component {
  @service currentUser;

  get isMultipleCurrentTargetProfiles() {
    return this.args.complementaryCertification.currentTargetProfiles?.length > 1;
  }

  get hasAccessToAttachNewTargetProfile() {
    return this.currentUser.adminMember.isSuperAdmin;
  }

  <template>
    <section class="page-section">
      <div class="content-text content-text--small complementary-certification-details">
        <h1 class="complementary-certification-details__title">Certification complémentaire</h1>

        <span class="complementary-certification-details__label">{{@complementaryCertification.label}}</span>
        {{#if @currentTargetProfile}}
          <LinkToCurrentTargetProfile @model={{@currentTargetProfile}} />
        {{/if}}
        {{#if this.isMultipleCurrentTargetProfiles}}
          <PixToggle
            @onLabel="Profil 1"
            @offLabel="Profil 2"
            @toggled={{@switchToggle}}
            @onChange={{@switchTargetProfile}}
            @screenReaderOnly={{true}}
          >
            <:label>Accéder aux détails des profils cibles courants</:label>
          </PixToggle>
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
