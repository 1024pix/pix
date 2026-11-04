import { PixButtonUpload, PixNotificationAlert, PixTable, PixTableColumn, PixTabs } from '@1024pix/nebulix-ember';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';

const join = (values) => values.join(', ');

// A reset row stands out: it is left out of the migration, with the older rows
// of its skill. The header cells get no row.
const cellClass = (knowledgeElement) =>
  knowledgeElement?.status === 'reset' ? 'knowledge-states-simulator__reset-cell' : '';

const toSimulation = (attributes) => ({
  knowledgeElementCount: attributes['knowledge-element-count'],
  knowledgeStateCount: attributes['knowledge-state-count'],
  knowledgeStates: attributes['knowledge-states'],
  userCompetenceScores: attributes['user-competence-scores'],
  totalPix: Math.round(attributes['user-competence-scores'].reduce((total, { pix }) => total + pix, 0) * 100) / 100,
  pixScore: attributes['pix-score'],
  pixScoreAfterMigration: attributes['pix-score-after-migration'],
  unknownSkillIds: attributes['unknown-skill-ids'],
});

export default class ToolsKnowledgeStates extends Component {
  @service store;
  @service intl;

  @tracked fileName = null;
  @tracked error = null;
  @tracked simulation = null;
  @tracked knowledgeElements = [];
  @tracked selectedTab = 'report';

  get tabs() {
    const { knowledgeStates, userCompetenceScores, unknownSkillIds } = this.simulation;
    return [
      { id: 'report' },
      { id: 'knowledge-elements', count: this.knowledgeElements.length },
      { id: 'knowledge-states', count: knowledgeStates.length },
      { id: 'scores', count: userCompetenceScores.length },
      { id: 'unknown-skills', count: unknownSkillIds.length },
    ];
  }

  @action
  selectTab(tab) {
    this.selectedTab = tab;
  }

  parseKnowledgeElements(content) {
    try {
      const knowledgeElements = JSON.parse(content);
      if (!Array.isArray(knowledgeElements)) {
        this.error = this.intl.t('pages.tools.knowledge-states.errors.not-an-array');
        return null;
      }
      return knowledgeElements;
    } catch {
      this.error = this.intl.t('pages.tools.knowledge-states.errors.invalid-json');
      return null;
    }
  }

  get reportRows() {
    const label = (key) => this.intl.t(`pages.tools.knowledge-states.labels.${key}`);
    return [
      { label: label('knowledge-element-count'), value: this.simulation.knowledgeElementCount },
      { label: label('knowledge-state-count'), value: this.simulation.knowledgeStateCount },
      { label: label('unknown-skill-count'), value: this.simulation.unknownSkillIds.length },
      { label: label('total-pix'), value: this.simulation.totalPix },
      { label: label('pix-score'), value: this.simulation.pixScore },
      { label: label('pix-score-after-migration'), value: this.simulation.pixScoreAfterMigration },
      {
        label: label('pix-score-difference'),
        value: this.simulation.pixScoreAfterMigration - this.simulation.pixScore,
      },
    ];
  }

  @action
  async simulate([file]) {
    this.error = null;
    this.simulation = null;
    this.knowledgeElements = [];
    this.selectedTab = 'report';
    this.fileName = file.name;

    const knowledgeElements = this.parseKnowledgeElements(await file.text());
    if (!knowledgeElements) return;

    try {
      const response = await this.store.adapterFor('knowledge-state-simulation').simulate(knowledgeElements);
      this.knowledgeElements = knowledgeElements;
      this.simulation = toSimulation(response.data.attributes);
    } catch (error) {
      const detail = error.errors?.map(({ detail }) => detail).join(', ') ?? error.message;
      this.error = this.intl.t('pages.tools.knowledge-states.errors.api', { detail });
    }
  }

  <template>
    <section class="page-section knowledge-states-simulator">
      <header class="page-section__header">
        <h2 class="page-section__title">{{t "pages.tools.knowledge-states.title"}}</h2>
      </header>

      <PixNotificationAlert class="tools__info" @type="info" @withIcon={{true}}>
        {{t "pages.tools.knowledge-states.description"}}
      </PixNotificationAlert>

      <div class="knowledge-states-simulator__upload">
        <PixButtonUpload @id="knowledge-elements-file" @onChange={{this.simulate}} accept=".json">
          {{t "pages.tools.knowledge-states.actions.upload"}}
        </PixButtonUpload>
        {{#if this.fileName}}
          <span class="knowledge-states-simulator__file-name">{{this.fileName}}</span>
        {{/if}}
      </div>

      {{#if this.error}}
        <PixNotificationAlert
          class="knowledge-states-simulator__error"
          @type="error"
        >{{this.error}}</PixNotificationAlert>
      {{/if}}

      {{#if this.simulation}}
        <PixTabs
          @variant="primary"
          @ariaLabel={{t "pages.tools.knowledge-states.tabs.aria-label"}}
          class="knowledge-states-simulator__tabs"
          role="tablist"
        >
          {{#each this.tabs as |tab|}}
            <button
              type="button"
              role="tab"
              aria-selected={{if (eq this.selectedTab tab.id) "true" "false"}}
              class={{if (eq this.selectedTab tab.id) "active"}}
              {{on "click" (fn this.selectTab tab.id)}}
            >
              {{t (concat "pages.tools.knowledge-states.tabs." tab.id)}}
              {{#if (gt tab.count -1)}}({{tab.count}}){{/if}}
            </button>
          {{/each}}
        </PixTabs>

        {{#if (eq this.selectedTab "report")}}
          <PixTable
            @variant="admin"
            @caption={{t "pages.tools.knowledge-states.tabs.report"}}
            @data={{this.reportRows}}
          >
            <:columns as |row context|>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.report-table.headers.indicator"}}</:header>
                <:cell>{{row.label}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.report-table.headers.value"}}</:header>
                <:cell>{{row.value}}</:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        {{/if}}

        {{#if (eq this.selectedTab "knowledge-elements")}}
          <PixTable
            @variant="admin"
            @caption={{t "pages.tools.knowledge-states.tabs.knowledge-elements"}}
            @data={{this.knowledgeElements}}
          >
            <:columns as |knowledgeElement context|>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.skill"}}</:header>
                <:cell>{{knowledgeElement.skillId}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.competence"}}</:header>
                <:cell>{{knowledgeElement.competenceId}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.status"}}</:header>
                <:cell>{{knowledgeElement.status}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.source"}}</:header>
                <:cell>{{knowledgeElement.source}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.earned-pix"}}</:header>
                <:cell>{{knowledgeElement.earnedPix}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class={{cellClass knowledgeElement}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-elements-table.headers.created-at"}}</:header>
                <:cell>{{knowledgeElement.createdAt}}</:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        {{/if}}

        {{#if (eq this.selectedTab "knowledge-states")}}
          <PixTable
            @variant="admin"
            @caption={{t "pages.tools.knowledge-states.tabs.knowledge-states"}}
            @data={{this.simulation.knowledgeStates}}
          >
            <:columns as |knowledgeState context|>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.tube"}}</:header>
                <:cell>{{knowledgeState.tubeId}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.floor"}}</:header>
                <:cell>{{knowledgeState.floor}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.ceiling"}}</:header>
                <:cell>{{if knowledgeState.ceiling knowledgeState.ceiling "-"}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.ceiling-at"}}</:header>
                <:cell>{{if knowledgeState.ceilingAt knowledgeState.ceilingAt "-"}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.direct-levels"}}</:header>
                <:cell>{{join knowledgeState.directLevels}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.knowledge-states-table.headers.updated-at"}}</:header>
                <:cell>{{knowledgeState.updatedAt}}</:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        {{/if}}

        {{#if (eq this.selectedTab "scores")}}
          <PixTable
            @variant="admin"
            @caption={{t "pages.tools.knowledge-states.tabs.scores"}}
            @data={{this.simulation.userCompetenceScores}}
          >
            <:columns as |score context|>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.scores-table.headers.competence"}}</:header>
                <:cell>{{score.competenceId}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.scores-table.headers.pix"}}</:header>
                <:cell>{{score.pix}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.scores-table.headers.pix-from-knowledge-states"}}</:header>
                <:cell>{{score.pixFromKnowledgeStates}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t "pages.tools.knowledge-states.scores-table.headers.displayed-pix"}}</:header>
                <:cell>{{score.displayedPix}}</:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}}>
                <:header>{{t
                    "pages.tools.knowledge-states.scores-table.headers.displayed-pix-after-migration"
                  }}</:header>
                <:cell>{{score.displayedPixAfterMigration}}</:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        {{/if}}

        {{#if (eq this.selectedTab "unknown-skills")}}
          {{#if this.simulation.unknownSkillIds.length}}
            <PixTable
              @variant="admin"
              @caption={{t "pages.tools.knowledge-states.tabs.unknown-skills"}}
              @data={{this.simulation.unknownSkillIds}}
            >
              <:columns as |skillId context|>
                <PixTableColumn @context={{context}}>
                  <:header>{{t "pages.tools.knowledge-states.unknown-skills-table.headers.skill"}}</:header>
                  <:cell>{{skillId}}</:cell>
                </PixTableColumn>
              </:columns>
            </PixTable>
          {{else}}
            <p>{{t "pages.tools.knowledge-states.unknown-skills-table.empty"}}</p>
          {{/if}}
        {{/if}}
      {{/if}}
    </section>
  </template>
}
