<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { formatCurrency, formatDate } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthUserStore()
const transactions = ref([])
const isLoading = ref(true)
const error = ref(null)

// Fetch user's transaction history
const fetchTransactions = async () => {
  if (!authStore.userData?.id) return
  
  isLoading.value = true
  error.value = null
  
  try {
    // Get all transactions where user is either buyer or seller
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        items:item_id (name, description, price, image)
      `)
      .or(`buyer_id.eq.${authStore.userData.id},seller_id.eq.${authStore.userData.id}`)
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    if (data) {
      transactions.value = data
    }
  } catch (err) {
    console.error('Error fetching transactions:', err)
    error.value = 'Failed to load transaction history. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Determine if user was buyer or seller in transaction
const getTransactionRole = (transaction) => {
  if (transaction.buyer_id === authStore.userData.id) {
    return 'buyer'
  } else if (transaction.seller_id === authStore.userData.id) {
    return 'seller'
  }
  return 'unknown'
}

// Get transaction status text
const getTransactionStatusText = (transaction) => {
  const role = getTransactionRole(transaction)
  if (role === 'buyer') {
    return 'Purchased'
  } else if (role === 'seller') {
    return 'Sold'
  }
  return 'Unknown'
}

onMounted(() => {
  fetchTransactions()
})
</script>

<template>
  <DashboardLayout>
    <template #content>
      <v-container>
        <!-- Page Header -->
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold text-pink">Transaction History</h1>
          <v-spacer></v-spacer>
          <v-btn 
            color="pink" 
            variant="text" 
            prepend-icon="mdi-arrow-left" 
            @click="router.push('/dashboard')"
          >
            Back to Dashboard
          </v-btn>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="pink"></v-progress-circular>
          <p class="mt-2">Loading transaction history...</p>
        </div>
        
        <!-- Error State -->
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="mb-6"
        >
          {{ error }}
        </v-alert>
        
        <!-- Empty State -->
        <div v-else-if="transactions.length === 0" class="text-center py-8">
          <v-icon icon="mdi-receipt-text-outline" size="64" color="grey-lighten-1"></v-icon>
          <h3 class="text-h6 mt-4">No Transactions Yet</h3>
          <p class="text-body-1 mt-2">You haven't made any purchases or sales yet.</p>
          <v-btn 
            color="pink" 
            variant="elevated" 
            class="mt-4" 
            @click="router.push('/dashboard')"
          >
            Browse Items
          </v-btn>
        </div>
        
        <!-- Transaction List -->
        <template v-else>
          <v-card v-for="(transaction, index) in transactions" :key="index" class="mb-4">
            <v-card-item>
              <template #prepend>
                <v-avatar rounded size="80" class="mr-4">
                  <v-img 
                    :src="transaction.items?.image" 
                    cover
                    class="bg-grey-lighten-2"
                  ></v-img>
                </v-avatar>
              </template>
              
              <v-card-title>
                <div class="d-flex align-center">
                  <span>{{ transaction.items?.name }}</span>
                  <v-chip
                    :color="getTransactionRole(transaction) === 'buyer' ? 'green' : 'blue'"
                    size="small"
                    class="ml-2"
                    variant="tonal"
                  >
                    {{ getTransactionStatusText(transaction) }}
                  </v-chip>
                </div>
              </v-card-title>
              
              <v-card-subtitle>
                {{ formatDate(transaction.created_at) }}
              </v-card-subtitle>
              
              <template #append>
                <div class="text-right">
                  <p class="text-h6 font-weight-bold text-pink mb-1">
                    {{ formatCurrency(transaction.items?.price * transaction.quantity) }}
                  </p>
                  <p class="text-caption">
                    {{ transaction.quantity }} item(s) × {{ formatCurrency(transaction.items?.price) }}
                  </p>
                </div>
              </template>
            </v-card-item>
          </v-card>
        </template>
      </v-container>
    </template>
  </DashboardLayout>
</template>
