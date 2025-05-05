import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { items as sampleItems } from '@/components/common/ItemList'

export const useItemsStore = defineStore('items', () => {
  // State
  const allItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const sampleItemsAdded = ref(false)
  
  // Getters
  const marketItems = computed(() => {
    return allItems.value.filter(item => item.quantity > 0)
  })
  
  const userItems = computed(() => (userId) => {
    if (!userId) return []
    return allItems.value.filter(item => item.seller_id === userId)
  })
  
  // Actions
  const fetchAllItems = async (forceRefresh = false) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Fetch items from the database
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      if (data && data.length > 0) {
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
          console.log(`Added ${newItems.length} new items to store`)
        }
        
        return data
      }
      return []
    } catch (err) {
      console.error('Error adding sample items:', err)
      
      // Fallback to local sample items
      const localSampleItems = itemsToProcess.map(item => ({
        ...item,
        id: null,
        seller_id: null
      }))
      
      // Add these to allItems if they're not already there
      const existingNames = new Set(allItems.value.map(item => item.name))
      const newItems = localSampleItems.filter(item => !existingNames.has(item.name))
      
      if (newItems.length > 0) {
        allItems.value = [...allItems.value, ...newItems]
        console.log(`Added ${newItems.length} local sample items to store`)
      }
      
      return []
    }
  }
  
  const addItem = async (newItem) => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: addError } = await supabase
        .from('items')
        .insert(newItem)
        .select()
      
      if (addError) throw addError
      
      if (data && data.length > 0) {
        // Add the new item to the local state
        allItems.value.unshift(data[0])
        return data[0]
      }
    } catch (err) {
      console.error('Error adding item:', err)
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  const updateItemQuantity = async (itemId, newQuantity) => {
    if (!itemId) return
    
    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
      
      if (updateError) throw updateError
      
      // Update local state
      const index = allItems.value.findIndex(item => item.id === itemId)
      if (index !== -1) {
        allItems.value[index].quantity = newQuantity
        
        // Remove item from list if quantity is 0
        if (newQuantity <= 0) {
          allItems.value.splice(index, 1)
        }
      }
    } catch (err) {
      console.error('Error updating item quantity:', err)
      error.value = err.message
    }
  }
  
  // Force a reload of all sample items
  const reloadAllSampleItems = async () => {
    console.log('Force reloading all sample items')
    sampleItemsAdded.value = false
    await fetchAllItems(true)
  }
  
  // Initialize store by fetching items
  fetchAllItems()
  
  return {
    allItems,
    marketItems,
    userItems,
    isLoading,
    error,
    fetchAllItems,
    addItem,
    updateItemQuantity,
    addSampleItems,
    reloadAllSampleItems
  }
})
