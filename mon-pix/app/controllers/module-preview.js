import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulePreviewController extends Controller {
  @service('store') store;

  @tracked module = `{
  "id": "0000000a-0000-0bcd-e000-0f0000gh0000",
  "slug": "demo-preview-modulix",
  "title": "Démo preview Modulix",
  "details": {
    "image": "https://images.pix.fr/modulix/placeholder-details.svg",
    "description": "Découvrez la page de prévisualisation pour contribuer à Modulix !",
    "duration": 5,
    "level": "Débutant",
    "objectives": [
      "Prévisualiser un Module",
      "Contribuer au contenu d'un Module"
    ]
  },
  "transitionTexts": [
    {
      "content": "<p>Voici un texte de transition</p>",
      "grainId": "1111111a-1111-1bcd-e111-1f1111gh1111"
    }
  ],
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
            "content": "<p>Voici un texte de leçon. Parfois, il y a des émojis pour aider à la lecture&nbsp;<span aria-hidden='true'>📚</span>️.<br>Et là, voici une image&#8239;!</p>"
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

  get passage() {
    return this.store.createRecord('passage');
  }

  get formattedModule() {
    if (!this.module || this.module === '') {
      return { grains: [], transitionTexts: [] };
    }

    const module = JSON.parse(this.module);

    return {
      ...module,
      grains: module.grains ?? [],
      transitionTexts: module.transitionTexts ?? [],
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
  grainTransition(grainId) {
    return this.formattedModule.transitionTexts.find((transition) => transition.grainId === grainId);
  }
}
