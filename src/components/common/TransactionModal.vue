<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { useItemsStore } from '@/stores/itemsStore'
import { formatCurrency, generateId } from '@/utils/helpers'

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

const emit = defineEmits(['close', 'transaction-complete', 'update:show'])

const authStore = useAuthUserStore()
const itemsStore = useItemsStore()
const quantity = ref(1)
const loading = ref(false)
const formValid = ref(true)

// Create a computed property for the dialog visibility
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// Calculate total price
const totalPrice = computed(() => {
  return props.item.price * quantity.value
})

// Quantity validation rules
const quantityRules = [
  v => !!v || 'Quantity is required',
  v => (v && !isNaN(v) && v > 0) || 'Quantity must be greater than 0',
  v => (v && v <= props.item.quantity) || `Only ${props.item.quantity} items available`
]

// Process transaction
const processTransaction = async () => {
  if (!authStore.userData?.id) {
    alert('Please log in to make a purchase')
    return
  }
  
  loading.value = true
  
  try {
    // For sample items that might not have an ID yet
    let itemId = props.item.id
    
    // If the item doesn't have an ID (like sample items from ItemList.js),
    // we need to first insert it into the items table
    if (!itemId) {
      console.log("Item has no ID, creating item in database first")
      
      // Insert the item into the database using the store
      const newItem = {
        name: props.item.name,
        description: props.item.description,
        price: props.item.price,
        quantity: props.item.quantity,
        image: props.item.image,
        seller_id: null // This is a sample item, so no seller
      }
      
      const addedItem = await itemsStore.addItem(newItem)
      
      if (!addedItem) {
        throw new Error("Failed to create item")
      }
      
      itemId = addedItem.id
      console.log("Created item with ID:", itemId)
    }
    
    // Insert transaction into the database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        item_id: itemId,
        quantity: quantity.value,
        buyer_id: authStore.userData.id,
        seller_id: props.item.seller_id || null // Use null if seller_id is not available
      })
    
    if (error) throw error
    
    // Update item quantity using the store
    const newQuantity = props.item.quantity - quantity.value
    await itemsStore.updateItemQuantity(itemId, newQuantity)
    
    // Emit transaction complete event
    emit('transaction-complete', {
      item: {
        ...props.item,
        id: itemId
      },
      quantity: quantity.value,
      total: totalPrice.value
    })
    
    // Close modal
    dialogVisible.value = false
  } catch (error) {
    console.error('Error processing transaction:', error)
    alert('Failed to process transaction. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog v-model="dialogVisible" max-width="500px" @click:outside="emit('close')">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold bg-pink text-white">
        Buy Item
      </v-card-title>
      
      <v-card-text class="pt-4">
        <div class="d-flex mb-4">
          <v-img
            :src="item.image"
            width="100"
            height="100"
            cover
            class="rounded mr-4"
          ></v-img>
          
          <div>
            <h3 class="text-h6 font-weight-bold">{{ item.name }}</h3>
            <p class="text-subtitle-2 text-truncate">{{ item.description }}</p>
            <p class="text-body-1 font-weight-bold text-pink">{{ formatCurrency(item.price) }}</p>
            <p class="text-caption">Available: {{ item.quantity }}</p>
          </div>
        </div>
        
        <v-divider class="mb-4"></v-divider>
        
        <v-form v-model="formValid">
          <v-text-field
            v-model="quantity"
            label="Quantity"
            type="number"
            :rules="quantityRules"
            min="1"
            :max="item.quantity"
            required
          ></v-text-field>
          
          <div class="d-flex justify-space-between align-center mt-4">
            <span class="text-body-1">Total:</span>
            <span class="text-h6 font-weight-bold text-pink">{{ formatCurrency(totalPrice) }}</span>
          </div>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="dialogVisible = false">Cancel</v-btn>
        <v-btn 
          color="pink" 
          variant="elevated" 
          :loading="loading"
          :disabled="!formValid"
          @click="processTransaction"
        >
          Confirm Purchase
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
