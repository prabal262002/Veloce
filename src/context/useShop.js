import { useContext } from 'react';
import ShopContext from './shopContext';

export default function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}