<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="d-flex align-center justify-center" style="height: 100vh;">
    <v-container>
      <div class="text-center">
        <v-icon icon="mdi-shield-lock" size="100" color="pink-lighten-2"></v-icon>
        
        <h1 class="text-h2 font-weight-bold mt-6 text-pink">403</h1>
        <h2 class="text-h4 mt-2">Access Forbidden</h2>
        
        <p class="text-body-1 mt-4 mb-8">
          You don't have permission to access this page. Please log in or contact support.
        </p>
        
        <div class="d-flex justify-center gap-4">
          <v-btn 
            color="grey" 
            variant="outlined" 
            @click="goBack"
          >
            Go Back
          </v-btn>
          
          <v-btn 
            color="pink" 
            variant="elevated" 
            @click="goHome"
          >
            Back to Home
          </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>
