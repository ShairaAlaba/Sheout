<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="6" md="5" lg="5">
            <div>
              <v-row>
                <h1 class="font-weight-bold title-name">
                  <v-icon class="icon-image" icon="mdi-dress"></v-icon>SHEOUT
                </h1>
              </v-row>
              <v-row>
                <h1 class="tagline">Style Your Way to Confidence</h1>
              </v-row>
            </div>
          </v-col>

          <v-col cols="12" sm="10" md="7" lg="5">
            <v-card class="mx-auto register-card" elevation="20">
              <v-card-title class="d-flex flex-column align-center">
                <img class="logo-image" src="/images/SheoutLogo.png" />
                <h3 class="text-center mt-4">Create Account</h3>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="bg-surface-light pt-4 px-6">
                <RegisterForm></RegisterForm>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>

<style scoped>
.icon-image {
  color: #ff69b4;
}

.title-name {
  font-size: 4.5rem;
  padding-left: 40px;
  text-align: center;
  background: linear-gradient(45deg, #ff69b4, #ff1493);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  font-size: 1.5rem;
  padding-left: 40px;
  color: #ff69b4;
}

.logo-image {
  max-width: 120px;
  height: auto;
}

.register-card {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  max-width: 500px;
}
</style>
