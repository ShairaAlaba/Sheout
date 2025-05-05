<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/helpers'

const cartStore = useCartStore()
const router = useRouter()

const proceedToCheckout = () => {
  cartStore.toggleCart()
  router.push('/checkout')
}
</script>

<template>
  <v-navigation-drawer
    v-model="cartStore.isCartOpen"
    location="right"
    temporary
    width="400"
  >
    <v-card flat>
      <v-card-title class="d-flex align-center bg-pink text-white py-4">
        <v-icon icon="mdi-cart" class="mr-2"></v-icon>
        Shopping Cart
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="cartStore.toggleCart">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-0">
        <div v-if="cartStore.cartItems.length === 0" class="text-center pa-8">
          <v-icon icon="mdi-cart-off" size="64" color="grey-lighten-1"></v-icon>
          <p class="text-body-1 mt-4">Your cart is empty</p>
          <v-btn 
            color="pink" 
            variant="text" 
            class="mt-4" 
            @click="cartStore.toggleCart"
            prepend-icon="mdi-shopping"
          >
            Continue Shopping
          </v-btn>
        </div>
        
        <v-list v-else lines="two">
          <v-list-item
            v-for="(item, index) in cartStore.cartItems"
            :key="index"
            :title="item.name"
            :subtitle="`Quantity: ${item.quantity} · ${formatCurrency(item.price)}`"
          >
            <template #prepend>
              <v-avatar rounded size="60">
                <v-img :src="item.image" cover></v-img>
              </v-avatar>
            </template>
            
            <template #append>
              <div class="d-flex flex-column align-end">
                <span class="text-body-1 font-weight-bold mb-1">
                  {{ formatCurrency(item.price * item.quantity) }}
                </span>
                <v-btn 
                  density="compact" 
                  icon="mdi-delete" 
                  variant="text" 
                  color="error"
                  @click="cartStore.removeFromCart(item.id)"
                ></v-btn>
              </div>
            </template>
          </v-list-item>
          
          <v-divider></v-divider>
          
          <v-list-item class="bg-grey-lighten-4">
            <template #prepend>
              <div class="text-subtitle-1 font-weight-bold">Total</div>
            </template>
            <template #append>
              <div class="text-h6 font-weight-bold text-pink">
                {{ formatCurrency(cartStore.totalPrice) }}
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      
      <v-card-actions v-if="cartStore.cartItems.length > 0" class="pa-4">
        <v-btn 
          block 
          color="pink" 
          variant="elevated" 
          @click="proceedToCheckout"
        >
          Proceed to Checkout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>
