import PixProgressGauge from '@1024pix/pix-ui/components/pix-progress-gauge';
import { hash } from '@ember/helper';
import { t } from 'ember-intl';

import TableHeader from '../../table/header';

function getCount(campaignCollectiveResult) {
  const competenceCollectiveResultsCount = campaignCollectiveResult.get('campaignCompetenceCollectiveResults').length;
  return competenceCollectiveResultsCount ? competenceCollectiveResultsCount : '-';
}

<template>
  <section class="competences-section">
    <h3 class="campaign-details-analysis campaign-details-analysis__header">
      {{t "pages.campaign-review.table.competences.title"}}
    </h3>
    <table
      class="panel panel--light-shadow competences-analysis__table content-text content-text--small"
      aria-label={{t "pages.campaign-review.table.competences.title"}}
    >
      <thead>
        <tr>
          <TableHeader @size="wide">{{t
              "pages.campaign-review.table.competences.column.competences"
              (hash count=(getCount @campaignCollectiveResult))
              htmlSafe=true
            }}</TableHeader>
          <TableHeader @size="wide">{{t "pages.campaign-review.table.competences.column.results.label"}}</TableHeader>
        </tr>
      </thead>
      <tbody>
        {{#each @campaignCollectiveResult.campaignCompetenceCollectiveResults as |competenceResult|}}
          <tr aria-label={{t "pages.campaign-review.table.competences.row-title"}}>
            <td class="competences-col__name">
              <span class="competences-col__border competences-col__border--{{competenceResult.areaColor}}"></span>
              <span>
                {{competenceResult.competenceName}}
              </span>
            </td>
            <td class="competences-col__gauge">
              <PixProgressGauge
                @value={{competenceResult.validatedSkillsPercentage}}
                @tooltipText={{t
                  "pages.campaign-review.table.competences.column.results.tooltip"
                  result=competenceResult.validatedSkillsPercentage
                  competence=competenceResult.competenceName
                  htmlSafe=true
                }}
              />
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </section>
</template>
