import UserDetailAuthenticationMethods from 'pix-admin/components/users/user-detail-authentication-methods';
<template>
  <UserDetailAuthenticationMethods
    @user={{@model.userProfile}}
    @removeAuthenticationMethod={{@controller.removeAuthenticationMethod}}
    @addPixAuthenticationMethod={{@controller.addPixAuthenticationMethod}}
    @reassignAuthenticationMethod={{@controller.reassignAuthenticationMethod}}
  />
</template>
