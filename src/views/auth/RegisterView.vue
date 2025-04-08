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

          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="mx-auto register-card" max-width="400" elevation="20">
              <v-card-title class="d-flex flex-column align-center">
                <img class="logo-image" src="/images/SheoutLogo.png" />
                <h3 class="text-center mt-4">Create Account</h3>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="bg-surface-light pt-4">
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
  -webkit-text-fill-color: transparent;
  font-family: 'Playfair Display', serif;
}

.tagline {
  font-style: italic;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  padding-left: 70px;
  text-align: center;
  color: #ff69b4;
}

.logo-image {
  width: 100px;
  height: auto;
  margin-top: 16px;
  border-radius: 50%;
}

.register-card {
  background: linear-gradient(135deg, #fff5f7, #ffffff);
  border: 1px solid rgba(255, 105, 180, 0.1);
}

.register-card .v-card-title {
  color: #ff69b4;
  font-family: 'Playfair Display', serif;
}
</style>
