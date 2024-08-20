import Card from '../../card';
import CertificationDetailsCompetence from '../details-competence';

<template>
  <div class="certification-details-v2">
    <div>
      <div>
        <Card>
          <div class="certification-details-v2__info">
            <div>Statut :</div>
            <div>{{@details.status}}</div>

            <div>Créé le :</div>
            <div>{{@details.creationDate}}</div>

            <div>Terminée le :</div>
            <div>{{@details.completionDate}}</div>

            <div>Score :</div>
            <div class="certificate">{{@details.totalScore}}</div>
            <div>Taux de reproductibilité :</div>
            <div class="certificate">{{@details.percentageCorrectAnswers}}</div>
          </div>
        </Card>
      </div>
      {{#each @details.competences as |competence|}}
        <CertificationDetailsCompetence @competence={{competence}} @rate={{@details.percentageCorrectAnswers}} />
      {{/each}}
    </div>
  </div>
</template>
