<script setup>
import { ref, onMounted } from 'vue'
import ProfileHeader from '@/components/layout/ProfileHeader.vue'
import CartDrawer from '@/components/common/CartDrawer.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useItemsStore } from '@/stores/itemsStore'
import { useCartStore } from '@/stores/cartStore'

const authStore = useAuthUserStore()
const itemsStore = useItemsStore()
const cartStore = useCartStore()
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
        <h1 class="text-h3"><i>Sheout</i></h1>

        <v-spacer></v-spacer>

        <div v-if="isLoggedIn" class="d-flex align-center">
          <v-badge
            :content="cartStore.totalItems"
            :model-value="cartStore.totalItems > 0"
            color="pink-darken-2"
            class="mr-4"
          >
            <v-btn icon @click="cartStore.toggleCart">
              <v-icon size="large">mdi-cart</v-icon>
            </v-btn>
          </v-badge>

          <ProfileHeader></ProfileHeader>
        </div>

        <v-btn icon @click="onToggleTheme" class="ml-5">
          <v-icon v-if="theme === 'light'">mdi-weather-night</v-icon>
          <v-icon v-else>mdi-weather-sunny</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>

      <v-footer color="pink" class="font-weight-bold" app border>
        <div class="text-center w-100">
          <div class="text-white">
            © {{ new Date().getFullYear() }} Sheout - Your Ultimate Fashion Destination
          </div>
          <div class="text-caption text-white">
            Shop the latest trends in fashion and style. Quality products, secure shopping, and fast
            delivery.
          </div>
        </div>
      </v-footer>

      <!-- Cart Drawer -->
      <CartDrawer v-if="isLoggedIn" />
    </v-app>
  </v-responsive>
</template>
