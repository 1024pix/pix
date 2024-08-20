import onEnterAction from '@1024pix/pix-ui/app/modifiers/on-enter-action';
import onSpaceAction from '@1024pix/pix-ui/app/modifiers/on-space-action';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class SearchBar extends Component {
  get debounce() {
    return ENV.searchTargetProfiles.debounce;
  }

  @action
  async onSearchValueInput(_, value) {
    this.args.onSearch(value);
  }

  @action
  onSelectTargetProfile(option) {
    this.args.onSelection(option);
  }

  <template>
    <div class="attach-target-profile-search">
      <div class="attach-target-profile-search__input">
        <PixSearchInput
          @id="search-input"
          @placeholder="Exemple: 3"
          @debounceTimeInMs={{this.debounce}}
          @triggerFiltering={{this.onSearchValueInput}}
          autocomplete="off"
        >
          <:label>ID du profil cible</:label>
        </PixSearchInput>

        {{#if @isLoading}}
          <span class="attach-target-profile-search__loader" role="progressbar">
            Recherche en cours...
          </span>
        {{/if}}

        {{#if @isNoResult}}
          <span class="attach-target-profile-search__no-result">
            Aucun résultat
          </span>
        {{/if}}

        {{#if @options.length}}
          <ul
            id="target-profiles-list"
            role="listbox"
            class="attach-target-profile-search__results"
            aria-busy="{{@isLoading}}"
          >
            {{#each @options as |option|}}
              <li
                class="attach-target-profile-search__results__option"
                role="option"
                aria-selected="false"
                tabindex="0"
                {{on "click" (fn this.onSelectTargetProfile option)}}
                {{onEnterAction (fn this.onSelectTargetProfile option)}}
                {{onSpaceAction (fn this.onSelectTargetProfile option)}}
              >
                {{option.label}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </div>
  </template>
}
