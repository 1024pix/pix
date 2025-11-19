import PixAppLayout from '@1024pix/pix-ui/components/pix-app-layout';
import PixToastContainer from '@1024pix/pix-ui/components/pix-toast-container';
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
