import { PixBlock, PixIcon, PixTag } from '@1024pix/nebulix-ember';
import { formatDate, t } from 'ember-intl';
import formatISODate from 'mon-pix/helpers/format-iso-date';

import DownloadPdf from '../certificate-information/download-pdf';

<template>
  <div class="certificate-hero">
    <PixBlock class="certificate-hero__infos-block">
      <div>
        {{#if @isUserCertificate}}
          <h2 class="certificate-hero__title" data-testid="pw-candidate-certificate-global-level">
            <strong>{{t "pages.certificate.congratulations"}}</strong>
            {{@subTitle}}
          </h2>
        {{else}}
          <PixTag @color="green" class="certificate-hero__valid-tag">
            <PixIcon @name="check" />
            {{t "pages.certificate.valid-status"}}
          </PixTag>

          <h2 class="certificate-hero__title" data-testid="pw-candidate-certificate-global-level">
            <strong>{{t "pages.certificate.valid-status"}}</strong>
            {{@subTitle}}
          </h2>
        {{/if}}

        {{yield to="stepper"}}

        <div class="certificate-hero__details">
          <p>
            <strong>
              {{t "pages.certificate.candidate"}}
              {{@certificate.firstName}}
              {{@certificate.lastName}}
            </strong><br />
            {{t
              "pages.certificate.candidate-birth-complete"
              birthdate=(formatISODate @certificate.birthdate format="L")
              birthplace=@certificate.birthplace
            }}
          </p>
          <dl>
            <dt><strong>{{t "pages.certificate.certification-center"}}</strong></dt>
            <dd><strong>{{@certificate.certificationCenter}}</strong></dd>

            <dt>{{t "pages.certificate.certification-date"}}</dt>
            <dd>{{formatDate @certificate.certificationDate format="L"}}</dd>

            <dt>{{t "pages.certificate.delivered-at"}}</dt>
            <dd>{{formatDate @certificate.deliveredAt format="L"}}</dd>
          </dl>
        </div>
      </div>
      <div class="certificate-hero__score">
        {{yield to="score"}}
      </div>
    </PixBlock>

    {{#if @isUserCertificate}}
      <DownloadPdf @certificate={{@certificate}} />
    {{/if}}
  </div>
</template>
