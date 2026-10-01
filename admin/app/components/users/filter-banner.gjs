import { PixFilterBanner, PixInput, PixSelect } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class UsersFilterBanner extends Component {
  @service intl;

  get queryTypes() {
    return [
      { value: 'CONTAINS', label: this.intl.t('pages.users-list.query.contains') },
      { value: 'EXACT_QUERY', label: this.intl.t('pages.users-list.query.exact') },
    ];
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @onClearFilters={{@clearSearchFields}}
      @onLoadFilters={{@refreshUsersList}}
      @loadFiltersLabel={{t "common.filters.actions.load"}}
      class="user-list-form"
    >
      <PixSelect
        @id="query-type-selector"
        @onChange={{@onChangeQueryType}}
        @value={{@queryTypeForm}}
        @options={{this.queryTypes}}
        @hideDefaultOption={{true}}
      >
        <:label>{{t "common.filters.common.selector"}}</:label>
      </PixSelect>

      <PixInput
        @id="userId"
        {{on "change" @onChangeUserId}}
        @value={{@idForm}}
        min="1"
        class="user-list-form__input--small"
        type="number"
        @size="small"
      >
        <:label>{{t "common.filters.common.internal-identifier"}}</:label>
      </PixInput>

      <PixInput
        @id="firstName"
        {{on "change" @onChangeFirstName}}
        @value={{@firstNameForm}}
        class="user-list-form__input--small"
        @size="small"
      >
        <:label>{{t "common.filters.users.firstname"}}</:label>
      </PixInput>

      <PixInput
        @id="lastName"
        {{on "change" @onChangeLastName}}
        class="user-list-form__input--small"
        @value={{@lastNameForm}}
        @size="small"
      >
        <:label>{{t "common.filters.users.lastname"}}</:label>
      </PixInput>

      <PixInput
        @id="email"
        {{on "change" @onChangeEmail}}
        @value={{@emailForm}}
        placeholder="unpetitpois@legume.org"
        class="user-list-form__input--small"
        type="text"
        @size="small"
      >
        <:label>{{t "common.filters.users.email"}}</:label>
      </PixInput>

      <PixInput
        @id="username"
        {{on "change" @onChangeUsername}}
        @value={{@usernameForm}}
        class="user-list-form__input--small"
        placeholder="petitpoisdu12"
        @size="small"
      >
        <:label>{{t "common.filters.users.username"}}</:label>
      </PixInput>
    </PixFilterBanner>
  </template>
}
