<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthUserStore()
const cartStore = useCartStore()
const isLoading = ref(false)
const formValid = ref(true)

// Form data
const checkoutForm = ref({
  address: '',
  city: '',
  postalCode: '',
  phone: ''
})

// Form validation rules
const requiredRule = [v => !!v || 'This field is required']
const phoneRule = [
  v => !!v || 'Phone number is required',
  v => /^\d{10,11}$/.test(v) || 'Phone number must be 10-11 digits'
]

// Check if cart is empty
const isCartEmpty = computed(() => {
  return cartStore.cartItems.length === 0
})

// Process checkout
const processCheckout = async () => {
  if (isCartEmpty.value) {
    alert('Your cart is empty')
    return
  }
  
  isLoading.value = true
  
  try {
    // Create transactions for each item in cart
    const transactions = []
    
    for (const item of cartStore.cartItems) {
      const transaction = {
        item_id: item.id,
        quantity: item.quantity,
        buyer_id: authStore.userData.id,
        seller_id: item.seller_id
      }
      transactions.push(transaction)
    }
    
    // Insert all transactions
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
    
    if (error) throw error
    
    // Update item quantities
    for (const item of cartStore.cartItems) {
      // Get current item quantity from database
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('quantity')
        .eq('id', item.id)
        .single()
      
      if (itemError) throw itemError
      
      // Calculate new quantity
      const newQuantity = itemData.quantity - item.quantity
      
      // Update item quantity
      const { error: updateError } = await supabase
        .from('items')
        .update({ quantity: newQuantity })
        .eq('id', item.id)
      
      if (updateError) throw updateError
    }
    
    // Clear cart
    cartStore.clearCart()
    
    // Show success message
    alert('Order placed successfully!')
    
    // Redirect to transaction history
    router.push('/transaction-history')
  } catch (err) {
    console.error('Error processing checkout:', err)
    alert('Failed to process checkout. Please try again.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Redirect to dashboard if cart is empty
  if (isCartEmpty.value) {
    router.push('/dashboard')
  }
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-container>
        <!-- Page Header -->
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold text-pink">Checkout</h1>
          <v-spacer></v-spacer>
          <v-btn 
            color="pink" 
            variant="text" 
            prepend-icon="mdi-arrow-left" 
            @click="router.push('/dashboard')"
          >
            Back to Shopping
          </v-btn>
        </div>
        
        <v-row>
          <!-- Checkout Form -->
          <v-col cols="12" md="8">
            <v-card class="mb-4">
              <v-card-title class="text-h5 font-weight-bold">
                Shipping Information
              </v-card-title>
              
              <v-card-text>
                <v-form v-model="formValid">
                  <v-textarea
                    v-model="checkoutForm.address"
                    label="Address"
                    :rules="requiredRule"
                    rows="2"
                    required
                  ></v-textarea>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="checkoutForm.city"
                        label="City"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="checkoutForm.postalCode"
                        label="Postal Code"
                        :rules="requiredRule"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <v-text-field
                    v-model="checkoutForm.phone"
                    label="Phone Number"
                    :rules="phoneRule"
                    required
                  ></v-text-field>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- Order Summary -->
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title class="text-h5 font-weight-bold">
                Order Summary
              </v-card-title>
              
              <v-card-text class="pa-0">
                <v-list lines="two">
                  <v-list-item
                    v-for="(item, index) in cartStore.cartItems"
                    :key="index"
                    :title="item.name"
                    :subtitle="`Quantity: ${item.quantity}`"
                  >
                    <template #prepend>
                      <v-avatar rounded size="40">
                        <v-img :src="item.image" cover></v-img>
                      </v-avatar>
                    </template>
                    
                    <template #append>
                      <div class="text-right">
                        <span class="text-body-1 font-weight-bold">
                          {{ formatCurrency(item.price * item.quantity) }}
                        </span>
                      </div>
                    </template>
                  </v-list-item>
                  
                  <v-divider></v-divider>
                  
                  <v-list-item class="bg-grey-lighten-4">
                    <template #prepend>
                      <div class="text-subtitle-1 font-weight-bold">Subtotal</div>
                    </template>
                    <template #append>
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ formatCurrency(cartStore.totalPrice) }}
                      </div>
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <template #prepend>
                      <div class="text-subtitle-1">Shipping</div>
                    </template>
                    <template #append>
                      <div class="text-subtitle-1">
                        {{ formatCurrency(50) }}
                      </div>
                    </template>
                  </v-list-item>
                  
                  <v-list-item class="bg-pink-lighten-5">
                    <template #prepend>
                      <div class="text-h6 font-weight-bold">Total</div>
                    </template>
                    <template #append>
                      <div class="text-h6 font-weight-bold text-pink">
                        {{ formatCurrency(cartStore.totalPrice + 50) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
              
              <v-card-actions class="pa-4">
                <v-btn 
                  block 
                  color="pink" 
                  variant="elevated" 
                  size="large"
                  :loading="isLoading"
                  :disabled="isCartEmpty"
                  @click="processCheckout"
                >
                  Place Order
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </DashboardLayout>
</template>
