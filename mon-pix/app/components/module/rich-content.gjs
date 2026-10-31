import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import GlossaryTerm from './glossary/term';

export default class ModulixRichContent extends Component {
  @tracked glossaryMarkers = [];

  collectGlossaryMarkers = modifier((element, [html]) => {
    if (!html) return;
    this.glossaryMarkers = [...element.querySelectorAll('[data-glossary-word]')].map((markerElement) => ({
      element: markerElement,
      word: markerElement.dataset.glossaryWord,
      text: markerElement.textContent,
    }));
  });

  <template>
    <div class="modulix-rich-content" {{this.collectGlossaryMarkers @html}}>{{htmlUnsafe @html}}</div>
    {{#each this.glossaryMarkers as |marker|}}
      {{#in-element marker.element}}
        <GlossaryTerm @word={{marker.word}} @text={{marker.text}} />
      {{/in-element}}
    {{/each}}
  </template>
}
