import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { formatDate, t } from 'ember-intl';
import formatISODate from 'mon-pix/helpers/format-iso-date';

import PixScoreHexagon from './pix-score-hexagon';

<template>
  <PixBlock class="candidate-information">
    <div class="candidate-information__score">
      <PixScoreHexagon @pixScore={{@certificate.pixScore}} />
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
            birthdate=(formatISODate @certificate.birthdate format="L")
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
