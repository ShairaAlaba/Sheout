<script setup>
import { ref, onMounted } from 'vue'
import ProfileHeader from '@/components/layout/ProfileHeader.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useItemsStore } from '@/stores/itemsStore'

const authStore = useAuthUserStore()
const itemsStore = useItemsStore()
const theme = ref(localStorage.getItem('theme') ?? 'light')
const isLoggedIn = ref(false)

const onToggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}

// Get Authentication status from supabase
const getLoggedStatus = async () => {
  isLoggedIn.value = await authStore.isAuthenticated()
  
  // If user is logged in, ensure items are loaded
  if (isLoggedIn.value) {
    await itemsStore.fetchAllItems()
  }
}

onMounted(() => {
  getLoggedStatus()
})
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar color="pink" border class="px-3">
        <h1 class="text-h6"><i>Sheout</i></h1>

        <v-spacer></v-spacer>

        <ProfileHeader v-if="isLoggedIn"></ProfileHeader>

        <v-btn icon @click="onToggleTheme">
          <v-icon v-if="theme === 'light'">mdi-weather-night</v-icon>
          <v-icon v-else>mdi-weather-sunny</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>

      <v-footer color="pink" class="font-weight-bold" app border> alrights 2025</v-footer>
    </v-app>
  </v-responsive>
</template>
