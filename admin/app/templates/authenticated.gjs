import { PixAppLayout, PixToastContainer } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import Sidebar from 'pix-admin/components/layout/sidebar';
<template>
  <PixAppLayout @variant="admin">
    <:navigation>
      <Sidebar />
    </:navigation>
    <:main>
      <main>
        {{outlet}}
      </main>
    </:main>
  </PixAppLayout>

  <PixToastContainer @closeButtonAriaLabel={{t "common.notifications.close-button.extra-information"}} />
</template>
