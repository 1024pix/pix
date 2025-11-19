import LoginForm from 'pix-admin/components/login-form';
<template>
  <div class="login-page">
    <main class="login-page__main">
      <LoginForm
        @unknownErrorHasOccured={{@controller.unknownErrorHasOccured}}
        @userShouldCreateAnAccount={{@controller.userShouldCreateAnAccount}}
        @userShouldRequestAccess={{@controller.userShouldRequestAccess}}
      />

      <footer>
      </footer>
    </main>
  </div>
</template>
