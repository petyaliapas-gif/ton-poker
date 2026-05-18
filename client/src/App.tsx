import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import OfferDetail from './pages/OfferDetail';
import SellerProfile from './pages/SellerProfile';
import Search from './pages/Search';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/offer/:id" element={<OfferDetail />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
