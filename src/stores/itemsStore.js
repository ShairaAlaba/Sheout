import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { items as sampleItems } from '@/components/common/ItemList'

// Debounce function to limit how often a function can be called
const debounce = (fn, delay) => {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export const useItemsStore = defineStore('items', () => {
  // State
  const allItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const sampleItemsAdded = ref(false)
  const firstItemLoaded = ref(false)
  
  // Getters
  const marketItems = computed(() => {
    return allItems.value.filter(item => item.quantity > 0)
  })
  
  const userItems = computed(() => (userId) => {
    if (!userId) return []
    return allItems.value.filter(item => item.seller_id === userId)
  })
  
  // Load the first item immediately for better UX
  const loadFirstItem = async () => {
    if (firstItemLoaded.value) return
    
    try {
      // Load just the first item from sample items
      const firstItem = sampleItems[0]
      
      // Add to local state immediately for instant display
      if (!allItems.value.some(item => item.name === firstItem.name)) {
        allItems.value = [{
          ...firstItem,
          id: 'temp-id-' + Date.now(),
          seller_id: null
        }, ...allItems.value]
      }
      
      firstItemLoaded.value = true
    } catch (err) {
      console.error('Error loading first item:', err)
    }
  }
  
  // Debounced version of loadFirstItem
  const debouncedLoadFirstItem = debounce(loadFirstItem, 300)
  
  // Actions
  const fetchAllItems = async (forceRefresh = false) => {
    isLoading.value = true
    error.value = null
    
    // Load first item immediately for better UX
    debouncedLoadFirstItem()
    
    try {
      // Fetch items from the database
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      if (data && data.length > 0) {
        // Replace the temporary first item with actual data
        allItems.value = data
        
        // Check if all sample items are in the database
        const sampleItemNames = new Set(sampleItems.map(item => item.name))
        const dbItemNames = new Set(data.map(item => item.name))
        
        // Find which sample items are missing
        const missingSampleItems = sampleItems.filter(item => !dbItemNames.has(item.name))
        
        console.log(`Found ${data.length} items in database, ${missingSampleItems.length} sample items missing`)
        
        // If any sample items are missing or force refresh is requested, add them
        if ((missingSampleItems.length > 0 || forceRefresh) && !sampleItemsAdded.value) {
          await addSampleItems(missingSampleItems)
          sampleItemsAdded.value = true
        }
      } else {
        // If no items found, add all sample items
        console.log('No items found in database, adding all sample items')
        await addSampleItems(sampleItems)
        sampleItemsAdded.value = true
      }
    } catch (err) {
      console.error('Error fetching items:', err)
      error.value = err.message
      
      // Fallback to sample items if database fetch fails
      console.log('Database fetch failed, using local sample items')
      allItems.value = [...sampleItems].map(item => ({
        ...item,
        id: null, // These will be created in DB when first transaction occurs
        seller_id: null
      }))
    } finally {
      isLoading.value = false
    }
  }
  
  const addSampleItems = async (itemsToProcess = sampleItems) => {
    console.log(`Adding ${itemsToProcess.length} sample items to database`)
    try {
      if (itemsToProcess.length === 0) return []
      
      // Add sample items to the database
      const itemsToAdd = itemsToProcess.map(item => ({
        ...item,
        seller_id: null // Sample items don't have a seller
      }))
      
      const { data, error: addError } = await supabase
        .from('items')
        .insert(itemsToAdd)
        .select()
      
      if (addError) throw addError
      
      if (data && data.length > 0) {
        console.log(`Successfully added ${data.length} sample items to database`)
        
        // Merge new items with existing items, avoiding duplicates
        const existingIds = new Set(allItems.value.map(item => item.id))
        const newItems = data.filter(item => !existingIds.has(item.id))
        
        if (newItems.length > 0) {
          allItems.value = [...allItems.value, ...newItems]
        }
        
        return data
      }
      
      return []
    } catch (err) {
      console.error('Error adding sample items:', err)
      return []
    }
  }
  
  const addItem = async (itemData) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        // Add the new item to the local state
        allItems.value = [data[0], ...allItems.value]
        return data[0]
      }
      
      return null
    } catch (err) {
      console.error('Error adding item:', err)
      return null
    }
  }
  
  const updateItemQuantity = (itemId, newQuantity) => {
    if (!itemId) return
    
    // Update the item in the local state
    const itemIndex = allItems.value.findIndex(item => item.id === itemId)
    
    if (itemIndex !== -1) {
      allItems.value[itemIndex] = {
        ...allItems.value[itemIndex],
        quantity: newQuantity
      }
    }
    
    // Update the item in the database
    supabase
      .from('items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating item quantity:', error)
        }
      })
  }
  
  return {
    allItems,
    isLoading,
    error,
    marketItems,
    userItems,
    fetchAllItems,
    addItem,
    updateItemQuantity,
    loadFirstItem
  }
})
