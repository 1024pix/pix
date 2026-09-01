import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Pagination from 'pix-orga/components/ui/pagination';

import PageTitle from '../ui/page-title';
import CoverRateGauge from './cover-rate-gauge';
import TagLevel from './tag-level';

export default class Statistics extends Component {
  @service intl;
  @service router;
  @service locale;

  @tracked currentDomainFilter = null;

  get analysisByTubes() {
    return this.args.model.data.sort(
      (a, b) => a.competence_code.localeCompare(b.competence_code) || a.sujet?.localeCompare(b.sujet),
    );
  }

  get analysisByDomains() {
    return this.analysisByTubes.reduce((acc, line) => {
      const domain = line.domaine;
      if (acc[domain]) {
        acc[domain].push(line);
      } else {
        acc[domain] = [line];
      }
      return acc;
    }, {});
  }

  get currentAnalysis() {
    if (this.currentDomainFilter !== null) {
      return this.analysisByDomains[this.currentDomainFilter];
    }
    return this.analysisByTubes;
  }

  get currentVisibleAnalysis() {
    const start = this.pageSize * (this.page - 1);
    const end = this.pageSize * this.page;
    return this.currentAnalysis.slice(start, end);
  }

  get domainsName() {
    return Object.keys(this.analysisByDomains).map((value) => {
      return {
        label: value,
        value,
      };
    });
  }

  get pageSize() {
    return Number(this.router.currentRoute?.queryParams?.pageSize) || 10;
  }

  get page() {
    return Number(this.router.currentRoute?.queryParams?.pageNumber) || 1;
  }

  get pagination() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      rowCount: this.currentAnalysis.length,
      pageCount: Math.ceil(this.currentAnalysis.length / this.pageSize),
    };
  }

  handleDomainFilter = (domain) => {
    this.currentDomainFilter = domain;
    this.router.replaceWith({ queryParams: { pageNumber: 1 } });
  };

  removeFilter = () => {
    this.currentDomainFilter = null;
    this.router.replaceWith({ queryParams: { pageNumber: 1 } });
  };

  get extractedDate() {
    return this.intl.formatDate(this.analysisByTubes[0]?.extraction_date, { format: 'LLL' });
  }

  get hasDataToDisplay() {
    return this.args.model.data && this.args.model.data.length > 0;
  }

  <template>
    <PageTitle @spaceBetweenTools={{true}}>
      <:title>
        {{t "pages.statistics.title"}}
      </:title>

      <:tools>
        {{#if this.hasDataToDisplay}}
          <span class="statistics-page-header__date">{{t "pages.statistics.before-date"}}
            {{this.extractedDate}}</span>
        {{/if}}
      </:tools>

    </PageTitle>

    {{#if this.hasDataToDisplay}}
      <section class="statistics-page__info">
        <p class="statistics-page-info__paragraph">
          {{t "pages.statistics.description" htmlSafe="true"}}
        </p>
      </section>

      <section class="statistics-page__filter">
        <PixSelect
          @onChange={{this.handleDomainFilter}}
          @value={{this.currentDomainFilter}}
          @options={{this.domainsName}}
          @placeholder={{t "common.filters.placeholder"}}
          @hideDefaultOption={{true}}
        >
          <:label>{{t "pages.statistics.select-label"}}</:label>
        </PixSelect>
        <PixButton @size="small" @variant="tertiary" @triggerAction={{this.removeFilter}}>{{t
            "common.filters.actions.clear"
          }}</PixButton>
      </section>

      <PixTable
        @variant="orga"
        class="table"
        @data={{this.currentVisibleAnalysis}}
        @caption={{t "pages.statistics.table.caption"}}
      >
        <:columns as |analysis context|>
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.statistics.table.headers.competences"}}</:header>
            <:cell>{{analysis.competence_code}} {{analysis.competence}}</:cell>
          </PixTableColumn>

          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.statistics.table.headers.topics"}}</:header>
            <:cell>{{analysis.sujet}}</:cell>
          </PixTableColumn>

          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.statistics.table.headers.positioning"}}</:header>
            <:cell>
              <CoverRateGauge @userLevel={{analysis.niveau_par_user}} @tubeLevel={{analysis.niveau_par_sujet}} />
            </:cell>
          </PixTableColumn>

          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.statistics.table.headers.reached-level"}}</:header>
            <:cell>
              <TagLevel @level={{analysis.niveau_par_user}} />
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <Pagination @pagination={{this.pagination}} />
    {{else}}
      <PixBlock class="empty-state" @variant="orga">
        <div class="empty-state__text">
          <p>{{t "pages.statistics.empty-state"}}</p>
        </div>
      </PixBlock>
    {{/if}}
  </template>
}
