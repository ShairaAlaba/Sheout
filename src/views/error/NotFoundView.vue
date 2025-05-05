<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="d-flex align-center justify-center" style="height: 100vh;">
    <v-container>
      <div class="text-center">
        <v-icon icon="mdi-map-marker-off" size="100" color="pink-lighten-2"></v-icon>
        
        <h1 class="text-h2 font-weight-bold mt-6 text-pink">404</h1>
        <h2 class="text-h4 mt-2">Page Not Found</h2>
        
        <p class="text-body-1 mt-4 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <v-btn 
          color="pink" 
          variant="elevated" 
          size="large"
          @click="goHome"
        >
          Back to Home
        </v-btn>
      </div>
    </v-container>
  </div>
</template>
