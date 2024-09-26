import Footer from './footer';
import Header from './header';

<template>
  <section class="authentication-layout">
    <img
      class="authentication-layout__image"
      alt=""
      role="presentation"
      src="/images/illustrations/authentication.svg"
    />

    <div class="authentication-layout__main">
      <Header>{{yield to="header"}}</Header>
      {{yield to="content"}}
      <Footer />
    </div>
  </section>
</template>
