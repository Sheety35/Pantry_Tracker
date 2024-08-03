// Function to sort inventory items by name or quantity
export const sortInventory = (inventory, sortBy) => {
    if (sortBy === 'name') {
      return [...inventory].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'quantity') {
      return [...inventory].sort((a, b) => a.quantity - b.quantity);
    }
    return inventory;
  };
  