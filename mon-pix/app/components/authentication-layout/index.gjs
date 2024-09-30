import Footer from './footer';
import Header from './header';

<template>
  <section class="authentication-layout">
    <div class="authentication-layout__side" role="presentation">
      <div class="authentication-layout__image">
        <img alt="" src="/images/illustrations/authentication.svg" />
      </div>
    </div>

    <div class="authentication-layout__main">
      <Header>
        {{yield to="header"}}
      </Header>

      <main ...attributes>
        {{yield to="content"}}
      </main>

      <Footer />
    </div>
  </section>
</template>
