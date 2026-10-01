import { PixAppLayout } from '@1024pix/nebulix-ember';
import Banners from 'pix-certif/components/layout/banners';
import Footer from 'pix-certif/components/layout/footer';
import Sidebar from 'pix-certif/components/layout/sidebar';

<template>
  <PixAppLayout @variant='certif'>
    <:navigation>
      <Sidebar />
    </:navigation>

    <:main>
      <main>
        <Banners />
        {{outlet}}
      </main>
    </:main>

    <:footer>
      <Footer />
    </:footer>
  </PixAppLayout>
</template>
