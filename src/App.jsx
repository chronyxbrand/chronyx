import React, { useEffect, useMemo, useState, useRef } from 'react';
import Lenis from 'lenis';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WhatsappLogo } from '@phosphor-icons/react';

import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ConsentPrompt from './components/ConsentPrompt';
import ExitIntentPopup from './components/ExitIntentPopup';
import BackToTop from './components/BackToTop';

import {
  CART_KEY,
  initialPayment,
  initialShipping,
  loadCart,
} from './data/store';
import { supabase } from './lib/supabase';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import ProductPage from './pages/ProductPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import NotFoundPage from './pages/NotFoundPage';
import AccountPage from './pages/AccountPage';
import TrackingPage from './pages/TrackingPage';
import PoliciesPage from './pages/PoliciesPage';
import AuthPage from './pages/AuthPage';

gsap.registerPlugin(ScrollTrigger);

function App() {
  return (
    <BrowserRouter>
      <StoreApp />
    </BrowserRouter>
  );
}

const WISHLIST_KEY = 'chronyx-wishlist';

function StoreApp() {
  const [theme, setTheme] = useState('night');
  const [splashDone, setSplashDone] = useState(false);
  const [cart, setCart] = useState(loadCart);
  const [shipping, setShipping] = useState(initialShipping);
  const [payment, setPayment] = useState(initialPayment);
  const [notice, setNotice] = useState('');
  
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_images(image_url, is_hero)`);
      
      if (error) throw error;

      const mappedProducts = data.map(p => {
        const heroImg = p.product_images?.find(img => img.is_hero)?.image_url || p.product_images?.[0]?.image_url || '';
        const gallery = p.product_images?.map(img => img.image_url) || [];

        return {
          id: p.id,
          name: p.name,
          tagline: p.tagline || p.description,
          category: p.category,
          price: Number(p.price),
          stockPercent: p.stock_quantity,
          size: p.size,
          finish: p.finish,
          material: p.material,
          movementType: p.movement_type,
          careInstructions: p.care_instructions || [],
          tags: p.tags || [],
          dropDate: p.drop_date,
          hero: heroImg,
          gallery: gallery,
          summary: p.summary,
          story: p.story || p.description,
          features: p.features || []
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const location = useLocation();
  const mainRef = useRef(null);

  const cartItems = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return null;
      return { ...product, quantity: item.quantity, lineTotal: item.quantity * product.price };
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'maple') html.setAttribute('data-theme', 'maple');
    else html.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, smoothTouch: false });
    let frame = 0;

    const raf = (time) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  // Page Transition & Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Simple page transition fade
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }

    // Scroll Animations (GSAP)
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        gsap.fromTo(section, 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.min(item.quantity + 1, 3) } : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const toggleWishlist = (productId) => {
    setWishlist(curr => 
      curr.includes(productId) ? curr.filter(id => id !== productId) : [...curr, productId]
    );
  };

  const updateCartQuantity = (productId, nextQuantity) => {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }, []);

  return (
    <div className="chronyx-app">
      <div className={splashDone ? 'splash-screen is-hidden' : 'splash-screen'}>
        <span>CHRONYX</span>
      </div>

      <SiteHeader
        cartCount={cartCount}
        theme={theme}
        setTheme={setTheme}
        notice={notice}
        setNotice={setNotice}
        wishlistCount={wishlist.length}
        user={user}
      />

      <main className="app-main" ref={mainRef}>
        {loadingProducts ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>Loading store...</div>
        ) : (
        <Routes>
          <Route
            path="/"
            element={<HomePage addToCart={addToCart} deliveryDate={deliveryDate} setNotice={setNotice} products={products} />}
          />
          <Route path="/products/:productId" element={<ProductPage addToCart={addToCart} products={products} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                cartTotal={cartTotal}
                updateCartQuantity={updateCartQuantity}
                clearCart={clearCart}
                products={products}
                user={user}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                cartTotal={cartTotal}
                shipping={shipping}
                setShipping={setShipping}
                user={user}
              />
            }
          />
          <Route
            path="/payment"
            element={
              <PaymentPage
                cartItems={cartItems}
                cartTotal={cartTotal}
                shipping={shipping}
                payment={payment}
                setPayment={setPayment}
                clearCart={clearCart}
                setNotice={setNotice}
                refreshProducts={fetchProducts}
              />
            }
          />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/shop" element={<ShopPage addToCart={addToCart} setNotice={setNotice} toggleWishlist={toggleWishlist} wishlist={wishlist} products={products} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/account" element={<AccountPage user={user} />} />
          <Route path="/auth" element={<AuthPage user={user} />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        )}
      </main>

      <SiteFooter />
      <ConsentPrompt />
      <ExitIntentPopup user={user} />
      <BackToTop />
      
      {/* WhatsApp Floating Widget */}
      <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="whatsapp-widget" aria-label="Chat on WhatsApp">
        <WhatsappLogo size={32} weight="fill" />
      </a>
    </div>
  );
}

export default App;
