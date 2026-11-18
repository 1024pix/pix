import { PixBlock } from '@1024pix/nebulix-ember';
import { formatDate, t } from 'ember-intl';
import formatISODate from 'mon-pix/helpers/format-iso-date';

<template>
  <PixBlock class="v2-header-details">
    <div class="v2-header-details__information">
      <div class="user-certification-hexagon-score">
        <div class="user-certification-hexagon-score__content">
          <p class="user-certification-hexagon-score__content-title">{{t "common.pix"}}</p>
          <p class="user-certification-hexagon-score__content-pix-score">{{@certificate.pixScore}}</p>
          <p class="user-certification-hexagon-score__content-certified">{{t
              "pages.certificate.hexagon-score.certified"
            }}</p>
        </div>
      </div>
      <div class="v2-header-details-information">
        <h1>{{t "pages.certificate.title"}}</h1>

        <ul>
          <li class="v2-header-details-information--grey">
            {{t "pages.certificate.issued-on"}}
            {{formatDate @certificate.deliveredAt format="LL"}}
          </li>
          <li>
            {{@certificate.fullName}}
          </li>
          <li class="v2-header-details-information--bold">
            {{#if @certificate.birthplace}}
              {{t
                "pages.certificate.candidate-birth-complete"
                birthdate=(formatISODate @certificate.birthdate format="LL")
                birthplace=@certificate.birthplace
              }}
            {{else}}
              {{t "pages.certificate.candidate-birth" birthdate=(formatISODate @certificate.birthdate format="LL")}}
            {{/if}}
          </li>
          {{#if @certificate.certificationCenter}}
            <li>{{t "pages.certificate.certification-center"}} {{@certificate.certificationCenter}}</li>
          {{/if}}
          <li>{{t "pages.certificate.exam-date"}} {{formatDate @certificate.date format="LL"}}</li>
        </ul>

        {{#if @certificate.shouldDisplayProfessionalizingWarning}}
          <p class="v2-header-details-information--professionalizing-warning">
            {{t "pages.certificate.professionalizing-warning"}}</p>
        {{/if}}
      </div>
    </div>
  </PixBlock>
</template>
