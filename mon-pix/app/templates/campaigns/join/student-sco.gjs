import LoginOrRegister from 'mon-pix/components/routes/login-or-register';
<template>
  <div class="student-sco">
    <LoginOrRegister
      @organizationName={{@model.campaign.organizationName}}
      @redirectionUrl={{@model.redirectionUrl}}
      @campaignCode={{@model.campaign.code}}
      @organizationId={{@model.campaign.organizationId}}
      @displayRegisterForm={{@controller.displayRegisterForm}}
      @toggleFormsVisibility={{@controller.toggleFormsVisibility}}
      @addGarAuthenticationMethodToUser={{@controller.addGarAuthenticationMethodToUser}}
    />
  </div>
</template>
