import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Checkout from './pages/Checkout.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Profile from './pages/Profile.jsx'
import {Routes, Route} from "react-router-dom";
import ShopProvider from './context/ShopContext.jsx'
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <ShopProvider>
      <Header />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer/>
      </ShopProvider>
    </>
  )
}

export default App
