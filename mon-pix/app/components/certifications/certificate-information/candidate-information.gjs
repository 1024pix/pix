import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { formatDate, t } from 'ember-intl';
import parseISODateOnly from 'mon-pix/utils/parse-iso-date-only';

<template>
  <PixBlock class="candidate-information">
    <div class="candidate-information__score">
      <div data-testid="pw-candidate-certificate-pix-score" class="candidate-information-score__hexagon">
        <span class="candidate-information-score-hexagon__pix">{{t "common.pix"}}</span>
        <span class="candidate-information-score-hexagon__score">{{@certificate.pixScore}}</span>
        <span class="candidate-information-score-hexagon__certified">{{t
            "pages.certificate.hexagon-score.certified"
          }}</span>
      </div>
      {{#if @certificate.globalLevelLabel}}
        <PixTag data-testid="global-level-label-tag">{{@certificate.globalLevelLabel}}</PixTag>
      {{/if}}
    </div>
    <div class="candidate-information__list">
      {{yield}}
      <ul>
        <li class="candidate-information-list--bold candidate-information-list__firstName">
          {{t "pages.certificate.candidate"}}
          {{@certificate.firstName}}
          {{@certificate.lastName}}
        </li>
        <li>
          {{t
            "pages.certificate.candidate-birth-complete"
            birthdate=(formatDate (parseISODateOnly @certificate.birthdate) format="L")
            birthplace=@certificate.birthplace
          }}
        </li>
        <li class="candidate-information-list--bold">
          {{t "pages.certificate.certification-center"}}
          {{@certificate.certificationCenter}}
        </li>
        <li>
          {{t "pages.certificate.certification-date"}}
          {{formatDate @certificate.certificationDate format="L"}}
        </li>
        <li>
          {{t "pages.certificate.delivered-at"}}
          {{formatDate @certificate.deliveredAt format="L"}}
        </li>
      </ul>
    </div>
  </PixBlock>
</template>
