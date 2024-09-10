import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

<template>
  <div class='session-details__header'>
    <div class='session-details-header__title'>
      <h1 class='page-title'>{{t 'pages.sessions.detail.title' sessionId=@sessionId}}</h1>
    </div>

    <div class='session-details-header__datetime'>
      <div class='session-details-header-datetime__date'>
        <h2 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.date'}}</h2>
        <span class='content-text content-text--big session-details-header-datetime__text'>
          {{dayjsFormat @sessionDate 'dddd DD MMM YYYY' allow-empty=true}}
        </span>
      </div>

      <div>
        <h2 class='label-text session-details-content__label'>{{t 'common.forms.session-labels.time-start'}}</h2>
        <span class='content-text content-text--big session-details-header-datetime__text'>
          {{dayjsFormat @sessionTime 'HH:mm' inputFormat='HH:mm:ss' allow-empty=true}}
        </span>
      </div>
    </div>
  </div>
</template>
