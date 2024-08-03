'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { firestore } from './firebase'; // Ensure the path is correct based on your project structure
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { filterInventory } from './search'; // Ensure the path is correct based on your project structure
import { sortInventory } from './sort'; // Import the sort function

// Styling for modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ddd',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

// Styling for item boxes with transparent and blur effect
const itemBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  bgcolor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
  backdropFilter: 'blur(8px)', // Blur effect
  borderRadius: 1,
  p: 2,
  m: 1,
  boxShadow: 1,
  width: '200px', // Larger width for item boxes
  minHeight: '100px', // Minimum height to ensure the box isn't too small
};

// Styling for the container to add space between button and items
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  p: 3,
  width: '100%',
  height: '100vh',
  position: 'relative',
  backgroundImage: 'url(/background.jpg)', // Path to your background image
  backgroundSize: 'cover', // Cover the entire container
  backgroundPosition: 'center', // Center the image
  backgroundRepeat: 'no-repeat', // Prevent repeating
};

// Styling for the header container
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: '1200px',
  marginBottom: '16px',
  position: 'relative',
  padding: '0 16px', // Add padding to ensure buttons are not touching the edges
};

const buttonContainerStyle = {
  display: 'flex',
  gap: 2,
  alignItems: 'center',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [removeQuantities, setRemoveQuantities] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false); // State for confirmation dialog
  const [sortBy, setSortBy] = useState('name'); // Default sorting by name

  // Function to update inventory
  const updateInventory = async () => {
    setLoading(true); // Set loading state
    try {
      const pantryCollectionRef = collection(firestore, 'inventory');
      const snapshot = await getDocs(pantryCollectionRef);
      const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
      setFilteredInventory(sortInventory(filterInventory(inventoryList, searchTerm), sortBy)); // Update filtered and sorted inventory
    } catch (error) {
      console.error("Error fetching inventory: ", error);
      setSnackbarMessage('Error fetching inventory');
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  useEffect(() => {
    updateInventory();
  }, [sortBy]);

  useEffect(() => {
    setFilteredInventory(sortInventory(filterInventory(inventory, searchTerm), sortBy)); // Filter and sort inventory when searchTerm, inventory, or sortBy changes
  }, [searchTerm, inventory, sortBy]);

  // Function to add an item to inventory
  const addItem = async (item, qty) => {
    setLoading(true); // Set loading state
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      const newQuantity = docSnap.exists() ? docSnap.data().quantity + parseInt(qty, 10) : parseInt(qty, 10);
      await setDoc(docRef, { quantity: newQuantity });
      await updateInventory();
      setSnackbarMessage('Item added successfully');
    } catch (error) {
      console.error("Error adding item: ", error);
      setSnackbarMessage('Error adding item');
    } finally {
      setLoading(false); // Reset loading state
      setSnackbarOpen(true);
    }
  };

  // Function to remove an item from inventory
  const removeItem = async (item, qty) => {
    setLoading(true); // Set loading state
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentQuantity = docSnap.data().quantity;
        const newQuantity = currentQuantity - parseInt(qty, 10);
        if (newQuantity <= 0) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: newQuantity });
        }
        await updateInventory();
        setSnackbarMessage('Item removed successfully');
      }
    } catch (error) {
      console.error("Error removing item: ", error);
      setSnackbarMessage('Error removing item');
    } finally {
      setLoading(false); // Reset loading state
      setSnackbarOpen(true);
    }
  };

  // Function to clear all items from inventory
  const clearInventory = async () => {
    setLoading(true); // Set loading state
    try {
      const batch = writeBatch(firestore);
      const pantryCollectionRef = collection(firestore, 'inventory');
      const snapshot = await getDocs(pantryCollectionRef);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      await updateInventory();
      setSnackbarMessage('Inventory cleared successfully');
    } catch (error) {
      console.error("Error clearing inventory: ", error);
      setSnackbarMessage('Error clearing inventory');
    } finally {
      setLoading(false); // Reset loading state
      setConfirmOpen(false); // Close confirmation dialog
      setSnackbarOpen(true);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRemoveQuantityChange = (itemName, value) => {
    setRemoveQuantities(prev => ({
      ...prev,
      [itemName]: value
    }));
  };

  const handleConfirmOpen = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  const handleSort = (sortCriteria) => {
    setSortBy(sortCriteria);
  };

  return (
    <Box sx={containerStyle}>
      <Box sx={headerStyle}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Add New Item
        </Button>
        <Box sx={buttonContainerStyle}>
          <Button
            variant="contained"
            onClick={() => handleSort('name')}
            sx={{ marginRight: 2 }}
          >
            Sort by Name
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSort('quantity')}
            sx={{ marginRight: 2 }}
          >
            Sort by Quantity
          </Button>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ backgroundColor: 'white', marginRight: 2 }} // Ensure white background for visibility
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmOpen}
          >
            Clear Inventory
          </Button>
        </Box>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack spacing={2}>
            <TextField
              id="item-name-add"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="item-quantity-add"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (itemName && quantity) {
                  addItem(itemName, quantity);
                  setItemName('');
                  setQuantity('');
                  handleClose();
                }
              }}
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} /> : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
      >
        <DialogTitle>Confirm Clear Inventory</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear the entire inventory? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button
            onClick={clearInventory}
            color="error"
          >
            Clear Inventory
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {loading ? (
        <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />
      ) : (
        <Box
          width="100%"
          display="flex"
          flexWrap="wrap"
          gap={2}
          p={4} // Add space between button and items
          sx={{ marginTop: '80px' }} // Ensure some space above the items
        >
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              sx={itemBoxStyle}
            >
              <Typography variant="h6" color="black">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body1" color="black">
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Remove Quantity"
                  variant="outlined"
                  type="number"
                  size="small"
                  value={removeQuantities[name] || ''}
                  onChange={(e) => handleRemoveQuantityChange(name, e.target.value)}
                />
                <Button
                  variant="contained"
                  color="warning" // Orange color for remove button
                  onClick={() => {
                    if (removeQuantities[name]) {
                      removeItem(name, removeQuantities[name]);
                      handleRemoveQuantityChange(name, ''); // Clear input field
                    }
                  }}
                  sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }} // Custom orange color
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
