import ScoSignupOrLogin from 'mon-pix/components/routes/sco-signup-or-login';
<template>
  <div class="student-sco">
    <ScoSignupOrLogin
      @organizationName={{@model.organizationToJoin.name}}
      @redirectionUrl={{@model.redirectionUrl}}
      @organizationId={{@model.organizationToJoin.id}}
      @displayScoSignupForm={{@controller.displayScoSignupForm}}
      @toggleFormsVisibility={{@controller.toggleFormsVisibility}}
      @addGarAuthenticationMethodToUser={{@controller.addGarAuthenticationMethodToUser}}
    />
  </div>
</template>
