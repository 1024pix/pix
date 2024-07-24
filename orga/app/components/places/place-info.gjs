import PixBlock from '@1024pix/pix-ui/components/pix-block';
import { t } from 'ember-intl';

<template>
  <PixBlock class="place-info">
    <img class="place-info__illustration" src="/icons/place-info.svg" alt="" role="none" />
    <div>
      <section class="place-info__description">
        <h2>{{t "cards.place-info.with-account.heading" htmlSafe=true}}</h2>
        <p class="place-info__message"> {{t "cards.place-info.with-account.message-main"}}</p>
        <i>{{t "cards.place-info.with-account.message-description"}}</i>
      </section>

      {{#if @hasAnonymousSeat}}
        <section class="place-info__description">
          <h2>{{t "cards.place-info.without-account.heading" htmlSafe=true}}</h2>
          <p class="place-info__message"> {{t "cards.place-info.without-account.message-main"}}</p>
          <i>{{t "cards.place-info.without-account.message-description"}}</i>
        </section>
      {{/if}}
    </div>
  </PixBlock>
</template>
