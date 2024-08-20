import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { or } from 'ember-truth-helpers';

export default class MenuBar extends Component {
  @service session;
  @service currentUser;
  @service accessControl;

  @action
  logout() {
    return this.session.invalidate();
  }

  <template>
    <nav class="menu-bar" aria-label="Navigation principale">
      <ul class="menu-bar__entries">
        <li class="menu-bar__entry">
          <PixTooltip @position="right">
            <:triggerElement>
              <LinkTo @route="authenticated.organizations" class="menu-bar__link">
                <FaIcon @icon="building" @title="Organisations" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Organisations</:tooltip>
          </PixTooltip>
        </li>
        <li class="menu-bar__entry">
          <PixTooltip @position="right">
            <:triggerElement>
              <LinkTo @route="authenticated.users" class="menu-bar__link">
                <FaIcon @icon="user" @title="Utilisateurs" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Utilisateurs</:tooltip>
          </PixTooltip>
        </li>
        <li class="menu-bar__entry">
          <PixTooltip @position="right" @inline={{true}}>
            <:triggerElement>
              <LinkTo @route="authenticated.certification-centers" class="menu-bar__link">
                <FaIcon @icon="map-pin" @title="Centres de certification" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Centres de certification</:tooltip>
          </PixTooltip>
        </li>
        <li class="menu-bar__entry">
          <PixTooltip @position="right" @inline={{true}}>
            <:triggerElement>
              <LinkTo @route="authenticated.sessions" class="menu-bar__link">
                <FaIcon @icon="chalkboard-user" @title="Sessions de certifications" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Sessions de certifications</:tooltip>
          </PixTooltip>
        </li>
        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right" @inline={{true}}>
              <:triggerElement>
                <LinkTo @route="authenticated.certifications" class="menu-bar__link">
                  <FaIcon @icon="graduation-cap" @title="Certifications" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Certifications</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}
        <li class="menu-bar__entry">
          <PixTooltip @position="right" @inline={{true}}>
            <:triggerElement>
              <LinkTo @route="authenticated.complementary-certifications" class="menu-bar__link">
                <FaIcon @icon="stamp" @title="Certifications complémentaires" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Certifications complémentaires</:tooltip>
          </PixTooltip>
        </li>
        {{#if this.accessControl.hasAccessToTargetProfilesActionsScope}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right" @inline={{true}}>
              <:triggerElement>
                <LinkTo @route="authenticated.target-profiles" class="menu-bar__link">
                  <FaIcon @icon="clipboard-list" @title="Profils cibles" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Profils cibles</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}

        {{#if
          (or
            this.currentUser.adminMember.isSuperAdmin
            this.currentUser.adminMember.isMetier
            this.currentUser.adminMember.isSupport
          )
        }}
          <li class="menu-bar__entry">
            <PixTooltip @position="right">
              <:triggerElement>
                <LinkTo @route="authenticated.autonomous-courses" class="menu-bar__link">
                  <FaIcon @icon="signs-post" @title="Parcours autonomes" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Parcours autonomes</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}

        {{#if this.currentUser.adminMember.isSuperAdmin}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right">
              <:triggerElement>
                <LinkTo @route="authenticated.team" class="menu-bar__link">
                  <FaIcon @icon="users" @title="Équipe" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Équipe</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}
        {{#if this.accessControl.hasAccessToTrainings}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right">
              <:triggerElement>
                <LinkTo @route="authenticated.trainings" class="menu-bar__link">
                  <FaIcon @icon="book-open" @title="Contenus formatifs" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Contenus formatifs</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}
        {{#if (or this.currentUser.adminMember.isSuperAdmin this.currentUser.adminMember.isMetier)}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right">
              <:triggerElement>
                <LinkTo @route="authenticated.tools" class="menu-bar__link">
                  <FaIcon @icon="screwdriver-wrench" @title="Outils" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Outils</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}
        {{#if this.currentUser.adminMember.isSuperAdmin}}
          <li class="menu-bar__entry">
            <PixTooltip @position="right">
              <:triggerElement>
                <LinkTo @route="authenticated.administration" class="menu-bar__link">
                  <FaIcon @icon="crown" @title="Administration" />
                </LinkTo>
              </:triggerElement>
              <:tooltip>Administration</:tooltip>
            </PixTooltip>
          </li>
        {{/if}}

        <li class="menu-bar__entry">
          <PixTooltip @position="right" @inline={{true}}>
            <:triggerElement>
              <LinkTo @route="logout" class="menu-bar__link">
                <FaIcon @icon="power-off" @title="Se déconnecter" />
              </LinkTo>
            </:triggerElement>
            <:tooltip>Se déconnecter</:tooltip>
          </PixTooltip>
        </li>
      </ul>
    </nav>
  </template>
}
