import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CourseCard from 'pix-orga/components/catalogue/course-card';
import EmptyState from 'pix-orga/components/ui/empty-state';
import ENV from 'pix-orga/config/environment';

import CourseModal from './course-modal.gjs';

export default class List extends Component {
  @service locale;
  @service intl;
  @service router;

  @tracked isModalOpen = false;

  constructor() {
    super(...arguments);

    if (this.args.currentCourse) {
      this.isModalOpen = true;
    }
  }

  @action
  selectCourse() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.router.transitionTo('authenticated.catalogue.list', this.args.type, {
      queryParams: { targetProfileId: null, blueprintId: null },
    });
    this.isModalOpen = false;
  }

  get isClearFiltersButtonDisabled() {
    const { search = '', category, areas, competences } = this.args;
    return !search && !category && !areas?.length && !competences?.length;
  }

  get categoriesOptions() {
    return [...new Set(this.filteredItems.flatMap((item) => (item.category ? item.category : [])))].map((item) => ({
      label: this.intl.t(`pages.campaign-creation.tags.${item}`),
      value: item,
    }));
  }

  get areasOptions() {
    return [...new Set(this.filteredItems.flatMap((item) => (item.areas ? item.areas : [])))]
      .sort((a, b) => a.code.localeCompare(b.code, this.locale.currentLanguage, { numeric: true }))
      .map((area) => ({
        label: `${area.code}. ${area.title}`,
        value: area.id,
      }));
  }

  get competencesOptions() {
    return [
      ...new Set(
        this.filteredItems
          .flatMap((item) => (item.areas ? item.areas : []))
          .flatMap((area) => (area.competences ? area.sortedCompetences : [])),
      ),
    ]
      .sort((a, b) => a.index.localeCompare(b.index, this.locale.currentLanguage, { numeric: true }))
      .map((competence) => ({
        label: `${competence.index} ${competence.name}`,
        value: competence.id,
      }));
  }

  get filteredItems() {
    const { type = 'all', search = '', category, areas, competences } = this.args;
    const filterByType = (item) => (type && type !== 'all' ? item.type === type : true);
    const filterByName = (item) => (search.length > 0 ? item.name.toLowerCase().includes(search.toLowerCase()) : true);
    const filterByCategory = (item) => (category ? category === item.category : true);

    const filterByArea = (item) => {
      if (areas?.length > 0) {
        const itemAreaIds = item.areas.map((area) => area.id);
        return areas.every((area) => itemAreaIds.includes(area));
      }
      return true;
    };

    const filterByCompetence = (item) => {
      if (competences?.length > 0) {
        const itemCompetenceIds = item.areas
          .flatMap((area) => (area.competences ? area.competences : []))
          .map((competence) => competence.id);
        return competences.every((competence) => itemCompetenceIds.includes(competence));
      }
      return true;
    };

    return this.args.courses.filter(
      (item) =>
        filterByType(item) &&
        filterByName(item) &&
        filterByCategory(item) &&
        filterByArea(item) &&
        filterByCompetence(item),
    );
  }

  <template>
    <div class="catalogue">
      <PixTabs @variant="orga" class="catalogue__nav" @ariaLabel={{t "pages.catalogue.tab-filters.label"}}>
        <LinkTo @route="authenticated.catalogue.list" @model="all">
          {{t "pages.catalogue.tab-filters.all"}}</LinkTo>
        <LinkTo @route="authenticated.catalogue.list" @model="targetProfile">{{t
            "pages.catalogue.tab-filters.target-profiles"
          }}</LinkTo>
        <LinkTo @route="authenticated.catalogue.list" @model="blueprint">{{t
            "pages.catalogue.tab-filters.blueprints"
          }}</LinkTo>
      </PixTabs>
      <PixFilterBanner
        class="catalogue__filters"
        @title={{t "common.filters.title"}}
        aria-label={{t "pages.catalogue.filters.aria-label"}}
        @details={{t "pages.catalogue.filters.nb-result" count=this.filteredItems.length}}
        @clearFiltersLabel={{t "common.filters.actions.clear"}}
        @onClearFilters={{@resetFilters}}
        @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
      >
        <PixSearchInput
          @id="search"
          value={{@search}}
          @placeholder={{t "pages.catalogue.filters.name.placeholder"}}
          @screenReaderOnly={{true}}
          @debounceTimeInMs={{ENV.pagination.debounce}}
          @triggerFiltering={{@updateFilter}}
        >
          <:label>{{t "pages.catalogue.filters.name.label"}}</:label>
        </PixSearchInput>

        {{#if (eq @type "targetProfile")}}
          <PixSelect
            @isDisabled={{eq this.categoriesOptions.length 0}}
            @placeholder={{t "pages.catalogue.filters.categories.all"}}
            @hideDefaultOption={{false}}
            @screenReaderOnly={{true}}
            @value={{@category}}
            @options={{this.categoriesOptions}}
            @onChange={{fn @updateFilter "category"}}
          >
            <:label>{{t "pages.catalogue.filters.categories.label"}}</:label>
          </PixSelect>
        {{/if}}
        <PixMultiSelect
          @isDisabled={{eq this.areasOptions.length 0}}
          @emptyMessage={{t "pages.catalogue.filters.areas.empty"}}
          @screenReaderOnly={{true}}
          @locale={{this.locale.currentLocale}}
          @values={{@areas}}
          @options={{this.areasOptions}}
          @onChange={{fn @updateFilter "areas"}}
        >
          <:label>{{t "pages.catalogue.filters.areas.label"}}</:label>
          <:placeholder>{{t "pages.catalogue.filters.areas.placeholder" count=@areas.length}}</:placeholder>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>

        <PixMultiSelect
          @isDisabled={{eq this.competencesOptions.length 0}}
          @emptyMessage={{t "pages.catalogue.filters.competences.empty"}}
          @screenReaderOnly={{true}}
          @locale={{this.locale.currentLocale}}
          @values={{@competences}}
          @options={{this.competencesOptions}}
          @onChange={{fn @updateFilter "competences"}}
        >
          <:label>{{t "pages.catalogue.filters.competences.label"}}</:label>
          <:placeholder>{{t "pages.catalogue.filters.competences.placeholder" count=@competences.length}}</:placeholder>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      </PixFilterBanner>
      {{#if this.filteredItems}}
        <div class="catalogue__list">
          {{#each this.filteredItems as |course|}}
            <CourseCard @course={{course}} @type={{@type}} @selectCourse={{this.selectCourse}} />
          {{/each}}
        </div>
      {{else}}
        <EmptyState @infoText={{t "pages.catalogue.empty-state"}} />
      {{/if}}

      {{#if @currentCourse}}
        <CourseModal
          @currentCourse={{@currentCourse}}
          @closeModal={{this.closeModal}}
          @isModalOpen={{this.isModalOpen}}
        />
      {{/if}}
    </div>
  </template>
}
