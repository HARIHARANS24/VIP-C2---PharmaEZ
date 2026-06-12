import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart({ items: [] }); return; }
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) { toast.error('Please login to add items to cart'); return false; }
    setCartLoading(true);
    try {
      const res = await api.post('/cart', { productId, quantity });
      setCart(res.data.cart);
      toast.success('Added to cart! 🛒');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.cart);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [] });
    } catch {}
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartSubtotal = cart.items?.reduce((sum, i) => {
    const price = i.discountPrice > 0 ? i.discountPrice : i.price;
    return sum + price * i.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartSubtotal, cartLoading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
