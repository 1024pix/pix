import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import UpdateExpiredPasswordForm from 'mon-pix/components/update-expired-password-form';
<template>
  {{pageTitle (t "pages.update-expired-password.title")}}
  <div class="update-expired-password-form-page">
    <UpdateExpiredPasswordForm @passwordResetToken={{@model.passwordResetToken}} />
  </div>
</template>
