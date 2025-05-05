<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/utils/helpers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const cartStore = useCartStore()
const quantity = ref(1)

// Create a computed property for the dialog visibility
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// Quantity validation rules
const quantityRules = [
  v => !!v || 'Quantity is required',
  v => (v && !isNaN(v) && v > 0) || 'Quantity must be greater than 0',
  v => (v && v <= props.item.quantity) || `Only ${props.item.quantity} items available`
]

// Calculate total price
const totalPrice = computed(() => {
  return props.item.price * quantity.value
})

// Add to cart
const addToCart = () => {
  cartStore.addToCart(props.item, quantity.value)
  dialogVisible.value = false
}
</script>

<template>
  <v-dialog v-model="dialogVisible" max-width="800px">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold bg-pink text-white">
        Item Details
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="dialogVisible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-0">
        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-img
              :src="item.image"
              height="400"
              cover
              class="bg-grey-lighten-2"
            ></v-img>
          </v-col>
          
          <v-col cols="12" md="6" class="pa-6">
            <h2 class="text-h4 font-weight-bold mb-2">{{ item.name }}</h2>
            <p class="text-h5 font-weight-bold text-pink mb-4">{{ formatCurrency(item.price) }}</p>
            
            <v-divider class="mb-4"></v-divider>
            
            <p class="text-body-1 mb-6">{{ item.description }}</p>
            
            <p class="text-body-2 mb-2">
              <v-icon icon="mdi-package-variant-closed" size="small" class="mr-1"></v-icon>
              Available: {{ item.quantity }} items
            </p>
            
            <div class="d-flex align-center mt-6">
              <v-text-field
                v-model="quantity"
                label="Quantity"
                type="number"
                :rules="quantityRules"
                min="1"
                :max="item.quantity"
                density="compact"
                class="mr-4"
                style="max-width: 100px"
              ></v-text-field>
              
              <v-btn 
                color="pink" 
                variant="elevated" 
                prepend-icon="mdi-cart-plus"
                @click="addToCart"
              >
                Add to Cart
              </v-btn>
            </div>
            
            <div class="mt-4 text-body-2 text-grey">
              <p v-if="quantity > 1" class="font-weight-bold">
                Total: {{ formatCurrency(totalPrice) }}
              </p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
