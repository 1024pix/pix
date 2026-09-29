import { PixProgressBar, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import EmptyState from '../../ui/empty-state';

function sortedCompetenceResults(results) {
  return results.sort((a, b) => {
    return a.index.localeCompare(b.index);
  });
}

function displayResults(results) {
  return results.length > 0;
}

function competenceCount(results) {
  return results.length;
}

<template>
  {{#if (displayResults @results)}}
    <PixTable
      @variant="orga"
      @caption={{t "pages.assessment-individual-results.table.title"}}
      @data={{sortedCompetenceResults @results}}
      class="table"
      @onRowClick={{@onClickCampaign}}
    >
      <:columns as |competenceResult context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.assessment-individual-results.table.column.competences" count=(competenceCount @results)}}
          </:header>
          <:cell>
            <span class="competences-col__border competences-col__border--{{competenceResult.areaColor}}">
              {{competenceResult.name}}
            </span>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.assessment-individual-results.table.column.results.label"}}
          </:header>
          <:cell>
            <PixProgressBar
              @value={{competenceResult.competenceMasteryRate}}
              @percentageValue={{t "common.result.percentage" value=competenceResult.competenceMasteryRate}}
              @tooltipText={{t
                "pages.assessment-individual-results.table.column.results.tooltip"
                result=competenceResult.competenceMasteryRate
                competence=competenceResult.name
                htmlSafe=true
              }}
            />
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

  {{else}}
    <EmptyState @infoText={{t "pages.assessment-individual-results.table.empty"}} />
  {{/if}}
</template>
