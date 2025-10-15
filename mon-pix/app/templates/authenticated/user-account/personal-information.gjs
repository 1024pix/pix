import t from 'ember-intl/helpers/t';
<template>
  <div class="personal-information">
    <div class="personal-information-item">
      <p class="form-textfield__label personal-information-item__label">
        {{t "pages.user-account.personal-information.first-name"}}
      </p>
      <p class="personal-information-item__value" data-test-firstName>{{@model.firstName}}</p>
    </div>

    <div class="personal-information-item">
      <p class="form-textfield__label personal-information-item__label">
        {{t "pages.user-account.personal-information.last-name"}}
      </p>
      <p class="personal-information-item__value" data-test-lastName>{{@model.lastName}}</p>
    </div>

    <div class="personal-information-item">
      <p class="form-textfield__label personal-information-item__label">
        {{t "pages.user-account.personal-information.personal-page-url"}}
      </p>
      <a
        href="{{@model.personalPageUrl}}"
        target="_blank"
        rel="noopener noreferrer"
        class="personal-information-item__value"
        data-test-lastName
      >{{@model.personalPageUrl}}</a>
    </div>
  </div>
</template>
