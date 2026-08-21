import { PixButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';

const LOCAL_STORAGE_KEY = 'QUEST_REQUIREMENT_SNIPPETS';

export default class SnippetList extends Component {
  get snippets() {
    const snippets = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) ?? {
      objectRequirementsByLabel: {},
    };
    return Object.keys(snippets.objectRequirementsByLabel);
  }

  <template>
    <ul class="quest-button-edition__list">
      {{#each this.snippets as |snippetName|}}
        <li>
          <PixButton @size="small" @variant="secondary" @triggerAction={{fn @triggerAction snippetName}}>
            {{snippetName}}
          </PixButton>
        </li>
      {{/each}}
    </ul>
  </template>
}
