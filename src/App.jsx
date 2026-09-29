import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
import {Routes, Route} from "react-router-dom";
import ShopProvider from './context/ShopContext.jsx'

function App() {
  return (
    <>
      <ShopProvider>
      <Header />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      <Footer />
      </ShopProvider>
    </>
  )
}

export default App
