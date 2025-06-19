import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ModulixGrain from 'mon-pix/components/module/grain/grain';

export default class ModulixPreview extends Component {
  @service store;
  @service modulixPreviewMode;

  @tracked moduleCodeDisplayed = false;

  @tracked
  module = `{
  "id": "0000000a-0000-0bcd-e000-0f0000gh0000",
  "slug": "demo-preview-modulix",
  "title": "Démo preview Modulix",
  "details": {
    "image": "https://images.pix.fr/modulix/placeholder-details.svg",
    "description": "Découvrez la page de prévisualisation pour contribuer à Modulix !",
    "duration": 5,
    "level": "Débutant",
    "tabletSupport": "comfortable",
    "objectives": [
      "Prévisualiser un Module",
      "Contribuer au contenu d'un Module"
    ]
  },
  "grains": [
    {
      "id": "1111111a-1111-1bcd-e111-1f1111gh1111",
      "type": "lesson",
      "title": "Voici une leçon",
      "components": [
        {
          "type": "element",
          "element": {
            "id": "2222222a-2222-2bcd-e222-2f2222gh2222",
            "type": "text",
            "content": "<h3>Voici une leçon</h3>"
          }
        },
        {
          "type": "element",
          "element": {
            "id": "3333333a-3333-3bcd-e333-3f3333gh3333",
            "type": "text",
            "content": "<p>Voici un texte de leçon. Parfois, il y a des émojis pour aider à la lecture&nbsp;<span aria-hidden='true'>📚</span>.<br>Et là, voici une image&#8239;!</p>"
          }
        },
        {
          "type": "element",
          "element": {
            "id": "4444444a-4444-4bcd-e444-4f4444gh4444",
            "type": "image",
            "url": "https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg",
            "alt": "Dessin détaillé dans l'alternative textuelle",
            "alternativeText": "Dessin d'un ordinateur dans un univers spatial."
          }
        }
      ]
    }
  ]
}`;
  @tracked errorMessage = null;

  constructor(owner, args) {
    super(owner, args);

    this.modulixPreviewMode.enable();

    const isWindowOpenedFromModulixEditor = window.opener !== null;
    if (isWindowOpenedFromModulixEditor) {
      window.addEventListener('message', (event) => {
        if (event.data?.from === 'modulix-editor') {
          this.module = JSON.stringify(event.data.moduleContent, null, 2);
        }
      });

      window.opener.postMessage({ from: 'pix-app', message: 'Ready to receive content !' }, '*');
    }
  }

  get passage() {
    return this.store.createRecord('passage');
  }

  get formattedModule() {
    console.log(this.args.module);
    if (this.args.module) {
      return this.args.module;
    }

    if (!this.module || this.module === '') {
      return { grains: [] };
    }

    const module = JSON.parse(this.module);

    return {
      ...module,
      grains: module.grains ?? [],
    };
  }

  @action
  noop() {}

  @action
  updateModule(event) {
    try {
      this.errorMessage = null;
      const parsedModule = JSON.parse(event.target.value);
      if (!parsedModule.grains) {
        return;
      }
      this.module = JSON.stringify(parsedModule, null, 2);
    } catch (e) {
      this.errorMessage = e.message;
    }
  }

  @action
  toggleModuleCodeEditor() {
    this.moduleCodeDisplayed = !this.moduleCodeDisplayed;
  }

  <template>
    {{pageTitle this.formattedModule.title}}

    <div class="module-preview__buttons">
      <PixButton @triggerAction={{this.toggleModuleCodeEditor}}>
        {{t "pages.modulix.preview.showJson"}}
      </PixButton>

      <PixButtonLink
        @variant="secondary"
        @href="https://1024pix.github.io/modulix-editor/"
        @size="small"
        target="_blank"
      >
        {{! template-lint-disable "no-bare-strings" }}
        Modulix Editor
      </PixButtonLink>
    </div>

    <div class="module-preview {{if this.moduleCodeDisplayed 'module-preview--with-editor'}}">
      <aside class="module-preview__passage">
        <div class="module-preview-passage__title">
          <h1>{{this.formattedModule.title}}</h1>
        </div>

        <div class="module-preview-passage__content">
          {{#each this.formattedModule.grains as |grain|}}
            <ModulixGrain
              @grain={{grain}}
              @onElementRetry={{this.noop}}
              @passage={{this.passage}}
              @onImageAlternativeTextOpen={{this.noop}}
              @onVideoTranscriptionOpen={{this.noop}}
              @onElementAnswer={{this.noop}}
              @onStepperNextStep={{this.noop}}
              @canMoveToNextGrain={{false}}
              @onGrainContinue={{this.noop}}
              @onGrainSkip={{this.noop}}
              @shouldDisplayTerminateButton={{false}}
              @onModuleTerminate={{this.noop}}
              @hasJustAppeared={{false}}
              @onVideoPlay={{this.noop}}
              @onFileDownload={{this.noop}}
            />
          {{/each}}
        </div>
      </aside>

      <main class="module-preview__form">
        {{#if this.moduleCodeDisplayed}}
          <PixTextarea
            class="module-preview-form__textarea"
            @id="module"
            @value={{this.module}}
            @errorMessage={{this.errorMessage}}
            {{on "change" this.updateModule}}
          >
            <:label>{{t "pages.modulix.preview.textarea-label"}}</:label>
          </PixTextarea>
        {{/if}}
      </main>
    </div>
  </template>
}
