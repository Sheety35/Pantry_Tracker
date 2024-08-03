// utils/searchUtils.js

/**
 * Filter inventory based on the search term.
 * @param {Array} inventory - The list of inventory items.
 * @param {string} searchTerm - The term to search for.
 * @returns {Array} - Filtered list of inventory items.
 */
export function filterInventory(inventory, searchTerm) {
    if (!searchTerm) return inventory;
  
    const lowercasedTerm = searchTerm.toLowerCase();
    return inventory.filter(({ name }) =>
      name.toLowerCase().includes(lowercasedTerm)
    );
  }
  