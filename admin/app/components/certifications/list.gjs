import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { LinkTo } from '@ember/routing';

import CertificationInfoPublished from './info-published';
import CertificationStatus from './status';

<template>
  <div class="table-admin">
    <table>
      <thead>
        <tr>
          <th class="table__column table__column--id">ID</th>
          <th>Prénom</th>
          <th>Nom</th>
          <th>Statut</th>
          <th>Signalements impactants non résolus</th>
          {{#if @displayHasSeenEndTestScreenColumn}}
            <th>Ecran de fin de test vu</th>
          {{/if}}
          <th>Autre certification</th>
          <th>Score</th>
          <th>Début</th>
          <th>Fin</th>
          <th>Publiée</th>
        </tr>
      </thead>

      {{#if @certifications}}
        <tbody>
          {{#each @certifications as |certification|}}
            <tr aria-label="Certifications de {{certification.firstName certification.LastName}}">
              <td class="table__column table__column--id">
                <LinkTo @route="authenticated.certifications.certification.informations" @model={{certification.id}}>
                  {{certification.id}}
                </LinkTo>
              </td>
              <td>{{certification.firstName}}</td>
              <td>{{certification.lastName}}</td>
              <td>
                <CertificationStatus @record={{certification}} />
              </td>
              <td
                class="certification-list-page__cell--important"
              >{{certification.numberOfCertificationIssueReportsWithRequiredActionLabel}}</td>
              {{#if @displayHasSeenEndTestScreenColumn}}
                <td class="certification-list-page__cell--important">{{certification.hasSeenEndTestScreenLabel}}</td>
              {{/if}}
              <td>{{certification.complementaryCertificationTakenLabel}}</td>
              <td>{{certification.pixScore}}</td>
              <td>{{certification.creationDate}}</td>
              <td>{{certification.completionDate}}</td>
              <td>
                <CertificationInfoPublished @record={{certification}} />
              </td>
            </tr>
          {{/each}}
        </tbody>
      {{/if}}
    </table>
  </div>

  {{#if @certifications}}
    <PixPagination @pagination={{@pagination}} />
  {{/if}}
</template>
