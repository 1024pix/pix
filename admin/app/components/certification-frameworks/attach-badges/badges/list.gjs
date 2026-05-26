import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import ContentHeader from './content-header';

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
    <div class="certification-framework-attach-badges">
      {{#if @error}}
        <PixNotificationAlert
          role="alert"
          @type="error"
          @withIcon={{true}}
          class="certification-framework-attach-badges__error"
        >
          {{@error}}
        </PixNotificationAlert>
      {{/if}}

      <section class="certification-framework-attach-badges__section">
        <h1>Badges certifiants</h1>

        <div class="certification-framework-attach-badges-section__table">
          <p>
            {{t "common.forms.mandatory-fields" htmlSafe=true}}
          </p>

          <PixTable @variant="admin" @data={{@options}} @caption="Liste des badges">
            <:columns as |row option|>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    ID
                  </ContentHeader>
                </:header>
                <:cell>
                  {{row.id}}
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    Nom
                  </ContentHeader>
                </:header>
                <:cell>
                  {{row.label}}
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    <:default>Niveau</:default>
                    <:tooltip>
                      Renseignez un chiffre unique pour chaque badge, niveau minimum = 1 niveau maximum = nombre total
                      de badge.
                    </:tooltip>
                  </ContentHeader>
                </:header>
                <:cell>
                  <PixInput
                    @id="{{row.id}}-level"
                    name="level"
                    placeholder="Exemple de niveau de badge : 1"
                    required="true"
                    aria-required="true"
                    @screenReaderOnly={{true}}
                    type="number"
                    min="1"
                    max="{{row.length}}"
                    {{on "input" (fn this.onBadgeUpdated row.id)}}
                    value="1"
                  >
                    <:label>{{row.id}} {{row.label}} Niveau</:label>
                  </PixInput>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader @isOptionnal="true">
                    <:default>Nombre de pix minimum</:default>
                  </ContentHeader>
                </:header>
                <:cell>
                  <PixInput
                    @id="{{row.id}}-minimum-earned-pix"
                    name="minimum-earned-pix"
                    placeholder="Ex : 150"
                    @screenReaderOnly={{true}}
                    type="number"
                    {{on "input" (fn this.onBadgeUpdated row.id)}}
                  >
                    <:label>{{row.id}} {{row.label}} Nombre de pix minimum</:label>
                  </PixInput>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    <:default>Image svg certificat Pix App</:default>
                    <:tooltip>
                      Renseignez l’URL de l’image au format .svg (fournie par les devs) pour le certificat Pix App du
                      candidat.
                    </:tooltip>
                  </ContentHeader>
                </:header>
                <:cell>
                  <PixInput
                    @id="{{row.id}}-certificate-image"
                    name="certificate-image"
                    placeholder="Ex : https://assets.pix.org/..."
                    required="true"
                    aria-required="true"
                    @screenReaderOnly={{true}}
                    type="text"
                    {{on "input" (fn this.onBadgeUpdated row.id)}}
                  >
                    <:label>{{row.id}} {{row.label}} Image svg certificat Pix App</:label>
                  </PixInput>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    <:default>Label du certificat</:default>
                    <:tooltip>
                      Renseignez un label qui permet de distinguer chaque badge (exemples : Pix+ Droit Expert, CléA
                      Numérique, Pix+ Edu 2nd degré Confirmé etc…)
                    </:tooltip>
                  </ContentHeader>
                </:header>
                <:cell>
                  <PixTextarea
                    @id="{{row.id}}-certificate-label"
                    name="certificate-label"
                    placeholder="Ex : Pix+ Édu 1er degré Initié (entrée dans le métier)"
                    required="true"
                    aria-required="true"
                    @screenReaderOnly={{true}}
                    rows="7"
                    {{on "input" (fn this.onBadgeUpdated row.id)}}
                  >
                    <:label>{{row.id}} {{row.label}} Label du certificat</:label>
                  </PixTextarea>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{option}}>
                <:header>
                  <ContentHeader>
                    <:default>Macaron de l'attestation PDF</:default>
                    <:tooltip>
                      Renseignez l’URL de l’image au format .pdf (fournie par les devs) pour l’attestation de
                      certification PDF du candidat.
                    </:tooltip>
                  </ContentHeader>
                </:header>
                <:cell>
                  <PixInput
                    @id="{{row.id}}-certificate-sticker"
                    name="certificate-sticker"
                    placeholder="Ex : https://assets.pix.org/..."
                    required="true"
                    aria-required="true"
                    @screenReaderOnly={{true}}
                    type="text"
                    {{on "input" (fn this.onBadgeUpdated row.id)}}
                  >
                    <:label>{{row.id}} {{row.label}} Macaron de l'attestation PDF</:label>
                  </PixInput>
                </:cell>
              </PixTableColumn>
              {{#if @hasExternalJury}}
                <PixTableColumn @context={{option}}>
                  <:header>
                    <ContentHeader>
                      <:default>Message du certificat</:default>
                      <:tooltip>
                        Renseignez le message définitif à afficher sur le certificat Pix App pour les certifications
                        comportant plusieurs volets (exemple : Vous avez obtenu la certification Pix+ Édu niveau
                        “Avancé”).
                      </:tooltip>
                    </ContentHeader>
                  </:header>
                  <:cell>
                    <PixTextarea
                      @id="{{row.id}}-certificate-message"
                      @screenReaderOnly={{true}}
                      name="certificate-message"
                      placeholder="Ex : Vous avez obtenu la certification Pix+Édu niveau “Initié (entrée dans le métier)”"
                      required="true"
                      {{on "input" (fn this.onBadgeUpdated row.id)}}
                    >
                      <:label>{{row.id}} {{row.label}} Message du certificat</:label>
                    </PixTextarea>
                  </:cell>
                </PixTableColumn>
                <PixTableColumn @context={{option}}>
                  <:header>
                    <ContentHeader>
                      <:default>Message temporaire certificat</:default>
                      <:tooltip>
                        Renseignez le message temporaire à afficher sur le certificat Pix App en attendant la validation
                        de tous les volets de la certification (exemple : Vous avez obtenu le niveau “Avancé” dans le
                        cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du
                        volet 2).
                      </:tooltip>
                    </ContentHeader>
                  </:header>
                  <:cell>
                    <PixTextarea
                      @id="{{row.id}}-certificate-temporary-message"
                      @screenReaderOnly={{true}}
                      name="certificate-temporary-message"
                      placeholder="Ex : Vous avez obtenu la certification Pix+Édu niveau “Initié (entrée dans le métier)”"
                      required="true"
                      {{on "input" (fn this.onBadgeUpdated row.id)}}
                    >
                      <:label>{{row.id}} {{row.label}} Message temporaire certificat</:label>
                    </PixTextarea>
                  </:cell>
                </PixTableColumn>
              {{/if}}
            </:columns>
          </PixTable>
        </div>
      </section>
    </div>
  </template>
}
