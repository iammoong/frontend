<script setup>
import LoginForm from './components/form/LoginForm.vue'
import AlertToast from './components/alert/AlertToast.vue'
</script>

<template>
  <v-app>
    <router-view/>
    <AlertToast/>
  </v-app>
</template>


<style lang="scss" scoped>

</style>