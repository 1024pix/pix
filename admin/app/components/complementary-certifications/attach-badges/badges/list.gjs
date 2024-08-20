import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Header from './header';
import Row from './row';

export default class List extends Component {
  @action
  onBadgeUpdated(badgeId, event) {
    this.args.onBadgeUpdated({
      badgeId,
      fieldName: event.target.name,
      fieldValue: event.target.value,
    });
  }

  <template>
    <div class="complementary-certification-attach-badges">
      {{#if @error}}
        <PixMessage
          role="alert"
          @type="error"
          @withIcon={{true}}
          class="complementary-certification-attach-badges__error"
        >
          {{@error}}
        </PixMessage>
      {{/if}}

      <section class="complementary-certification-attach-badges__section">
        <h1>Résultats thématiques certifiants</h1>

        <div class="complementary-certification-attach-badges-section__table">
          <p>
            {{t "common.forms.mandatory-fields" htmlSafe=true}}
          </p>

          <table aria-label="Liste des résultats thématiques">
            <thead>
              <tr>
                <Header>
                  ID
                </Header>
                <Header>
                  Nom
                </Header>
                <Header>
                  <:default>Niveau</:default>
                  <:tooltip>
                    Renseignez un chiffre unique pour chaque RT, niveau minimum = 1 niveau maximum = nombre total de RT.
                  </:tooltip>
                </Header>
                <Header @isOptionnal="true">
                  <:default>Nombre de pix minimum</:default>
                </Header>
                <Header>
                  <:default>Image svg certificat Pix App</:default>
                  <:tooltip>
                    Renseignez l’URL de l’image au format .svg (fournie par les devs) pour le certificat Pix App du
                    candidat.
                  </:tooltip>
                </Header>
                <Header>
                  <:default>Label du certificat</:default>
                  <:tooltip>
                    Renseignez un label qui permet de distinguer chaque RT (exemples : Pix+ Droit Expert, CléA
                    Numérique, Pix+ Edu 2nd degré Confirmé etc…)
                  </:tooltip>
                </Header>
                <Header>
                  <:default>Macaron de l'attestation PDF</:default>
                  <:tooltip>
                    Renseignez l’URL de l’image au format .pdf (fournie par les devs) pour l’attestation de
                    certification PDF du candidat.
                  </:tooltip>
                </Header>
                {{#if @hasExternalJury}}
                  <Header>
                    <:default>Message du certificat</:default>
                    <:tooltip>
                      Renseignez le message définitif à afficher sur le certificat Pix App pour les certifications
                      comportant plusieurs volets (exemple : Vous avez obtenu la certification Pix+ Edu niveau
                      “Avancé”).
                    </:tooltip>
                  </Header>
                  <Header>
                    <:default>Message temporaire certificat</:default>
                    <:tooltip>
                      Renseignez le message temporaire à afficher sur le certificat Pix App en attendant la validation
                      de tous les volets de la certification (exemple : Vous avez obtenu le niveau “Avancé” dans le
                      cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet
                      2).
                    </:tooltip>
                  </Header>
                {{/if}}
              </tr>
            </thead>
            <tbody>
              {{#each @options as |option|}}
                <Row
                  @badgeId={{option.id}}
                  @badgeLabel={{option.label}}
                  @badgeMaxLevel={{option.length}}
                  @onFieldUpdate={{this.onBadgeUpdated}}
                  @hasExternalJury={{@hasExternalJury}}
                />
              {{/each}}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </template>
}
