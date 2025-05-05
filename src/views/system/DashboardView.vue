<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { useItemsStore } from '@/stores/itemsStore'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, truncateText } from '@/utils/helpers'
import TransactionModal from '@/components/common/TransactionModal.vue'
import ItemDetailModal from '@/components/common/ItemDetailModal.vue'

const router = useRouter()
const authStore = useAuthUserStore()
const itemsStore = useItemsStore()
const cartStore = useCartStore()

const dialog = ref(false)
const loading = ref(false)
const formValid = ref(true)
const transactionDialog = ref(false)
const detailDialog = ref(false)
const selectedItem = ref(null)

// Get market items from the store
const marketItems = computed(() => itemsStore.marketItems)

// Get user's items from the store
const userItems = computed(() => {
  if (!authStore.userData?.id) return []
  return itemsStore.userItems(authStore.userData.id)
})

// Form data for new item
const newItem = ref({
  name: '',
  description: '',
  price: null,
  quantity: null,
  image: null,
})

// Form validation rules
const nameRules = [(v) => !!v || 'Name is required']
const descriptionRules = [(v) => !!v || 'Description is required']
const priceRules = [
  (v) => !!v || 'Price is required',
  (v) => (v && !isNaN(v) && v > 0) || 'Price must be greater than 0',
]
const quantityRules = [
  (v) => !!v || 'Quantity is required',
  (v) => (v && !isNaN(v) && v > 0) || 'Quantity must be greater than 0',
]
const imageRules = [(v) => !!v || 'Image is required']

// File upload handling
const imageFile = ref(null)
const previewUrl = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    newItem.value.image = file.name
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Submit form to add new item
const submitItem = async () => {
  loading.value = true

  try {
    // First upload the image to storage
    if (imageFile.value) {
      const fileName = `${Date.now()}_${imageFile.value.name}`
      const { data, error } = await supabase.storage
        .from('sheout')
        .upload(`image_items/${fileName}`, imageFile.value)

      if (error) throw error

      // Get public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from('sheout').getPublicUrl(`image_items/${fileName}`)

      // Create item object
      const itemData = {
        name: newItem.value.name,
        description: newItem.value.description,
        price: parseFloat(newItem.value.price),
        quantity: parseInt(newItem.value.quantity),
        seller_id: authStore.userData.id,
        image: publicUrl,
      }

      // Add item using the store
      const addedItem = await itemsStore.addItem(itemData)

      if (!addedItem) {
        throw new Error('Failed to add item to database')
      }

      // Reset form
      resetForm()
      dialog.value = false
    }
  } catch (error) {
    console.error('Error adding item:', error)
    alert('Failed to add item. Please try again.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  newItem.value = {
    name: '',
    description: '',
    price: null,
    quantity: null,
    image: null,
  }
  imageFile.value = null
  previewUrl.value = null
}

// Open transaction modal for buying an item
const openBuyModal = (item) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  selectedItem.value = item
  transactionDialog.value = true
}

// Open item detail modal
const openDetailModal = (item) => {
  selectedItem.value = item
  detailDialog.value = true
}

// Add item to cart
const addToCart = (item, quantity = 1) => {
  cartStore.addToCart(item, quantity)
}

// Handle transaction completion
const handleTransactionComplete = (transaction) => {
  // Update the item quantity in the store
  itemsStore.updateItemQuantity(
    transaction.item.id,
    transaction.item.quantity - transaction.quantity,
  )

  // Show success message
  alert(
    `Purchase successful! You bought ${transaction.quantity} ${transaction.item.name} for ${formatCurrency(transaction.total)}`,
  )
}

onMounted(async () => {
  // Force reload all sample items to ensure they all appear
  await itemsStore.loadFirstItem()
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-container>
        <!-- Page Header -->
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold text-pink">Happy Shopping</h1>
          <v-spacer></v-spacer>
          <v-btn color="pink" prepend-icon="mdi-plus" variant="elevated" @click="dialog = true">
            Sell Item
          </v-btn>
        </div>

        <!-- Loading State -->
        <div v-if="itemsStore.isLoading" class="text-center py-4">
          <v-progress-circular indeterminate color="pink"></v-progress-circular>
          <p class="mt-2 text-body-1">Loading items...</p>
        </div>

        <template v-else>
          <!-- Your Items Section -->
          <v-card class="mb-6">
            <v-card-title class="text-h5 font-weight-bold"> Your Items for Sale </v-card-title>
            <v-card-text>
              <v-row v-if="userItems.length > 0">
                <v-col
                  v-for="(item, index) in userItems"
                  :key="item.id || index"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card height="100%" @click="openDetailModal(item)" class="item-card">
                    <v-img :src="item.image" height="200" cover class="bg-grey-lighten-2"></v-img>
                    <v-card-title class="text-subtitle-1 font-weight-bold">
                      {{ item.name }}
                    </v-card-title>
                    <v-card-text>
                      <p class="text-truncate mb-2">{{ truncateText(item.description, 60) }}</p>
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-pink font-weight-bold">{{
                          formatCurrency(item.price)
                        }}</span>
                        <span class="text-caption">Qty: {{ item.quantity }}</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <div v-else class="text-center py-4">
                <p class="text-body-1">You don't have any items for sale yet.</p>
                <v-btn color="pink" prepend-icon="mdi-plus" class="mt-2" @click="dialog = true">
                  Sell Your First Item
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Market Items Section -->
          <v-card>
            <v-card-title class="text-h5 font-weight-bold">
              Market Items
            </v-card-title>
            <v-card-text>
              <v-row v-if="marketItems.length > 0">
                <v-col
                  v-for="(item, index) in marketItems"
                  :key="item.id || index"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card height="100%" class="item-card">
                    <v-img
                      :src="item.image"
                      height="200"
                      cover
                      class="bg-grey-lighten-2"
                      @click="openDetailModal(item)"
                    ></v-img>
                    <v-card-title
                      class="text-subtitle-1 font-weight-bold"
                      @click="openDetailModal(item)"
                    >
                      {{ item.name }}
                    </v-card-title>
                    <v-card-text @click="openDetailModal(item)">
                      <p class="text-truncate mb-2">{{ truncateText(item.description, 60) }}</p>
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-pink font-weight-bold">{{
                          formatCurrency(item.price)
                        }}</span>
                        <span class="text-caption">Qty: {{ item.quantity }}</span>
                      </div>
                    </v-card-text>
                    <v-card-actions class="d-flex flex-column gap-2">
                      <v-btn
                        color="pink"
                        variant="text"
                        prepend-icon="mdi-cart-plus"
                        @click.stop="addToCart(item)"
                        block
                      >
                        Add to Cart
                      </v-btn>
                      <v-btn color="pink" variant="elevated" @click.stop="openBuyModal(item)" block>
                        Buy Now
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
              <div v-else class="text-center py-4">
                <p class="text-body-1">No items available in the market.</p>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </v-container>

      <!-- Sell Item Dialog -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold bg-pink text-white">
            Sell New Item
          </v-card-title>
          <v-card-text class="pt-4">
            <v-form v-model="formValid" @submit.prevent="submitItem">
              <v-text-field
                v-model="newItem.name"
                label="Item Name"
                :rules="nameRules"
                required
              ></v-text-field>

              <v-textarea
                v-model="newItem.description"
                label="Description"
                :rules="descriptionRules"
                required
              ></v-textarea>

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="newItem.price"
                    label="Price (₱)"
                    type="number"
                    :rules="priceRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="newItem.quantity"
                    label="Quantity"
                    type="number"
                    :rules="quantityRules"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-file-input
                label="Upload Image"
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleFileUpload"
                :rules="imageRules"
                required
              ></v-file-input>

              <div v-if="previewUrl" class="mb-4">
                <p class="text-body-2 mb-2">Image Preview:</p>
                <v-img
                  :src="previewUrl"
                  max-height="200"
                  contain
                  class="bg-grey-lighten-3 rounded"
                ></v-img>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="dialog = false">Cancel</v-btn>
            <v-btn
              color="pink"
              variant="elevated"
              :loading="loading"
              :disabled="!formValid"
              @click="submitItem"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Transaction Modal -->
      <TransactionModal
        v-if="selectedItem"
        :item="selectedItem"
        v-model:show="transactionDialog"
        @transaction-complete="handleTransactionComplete"
      />

      <!-- Item Detail Modal -->
      <ItemDetailModal v-if="selectedItem" :item="selectedItem" v-model:show="detailDialog" />
    </template>
  </DashboardLayout>
</template>

<style scoped>
.item-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.item-card .v-img {
  height: 300px !important;
  object-fit: cover;
  object-position: center;
}

.item-card .v-card-title {
  font-size: 1.1rem;
  line-height: 1.4;
  height: 3.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-card .v-card-text {
  flex-grow: 1;
}

.item-card .v-card-actions {
  padding: 12px 16px;
}
</style>
