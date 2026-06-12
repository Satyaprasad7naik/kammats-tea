import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '../components/Navbar';
import FooterSection from '../sections/FooterSection';
import TestimonialSection from '../sections/TestimonialSection';

const products = [
  {
    id: '1',
    name: 'Chocolate Milk',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e515a96de6ca581e89ee2_Shop-product-cup_1.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e5150e05e18c255f70b1c_Shop-product-back_1.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e515f8a6b1236299f2b17_pieces.png',
    color: '#d69766',
    textColor: '#fff',
    path: '/product/chocolate-milk'
  },
  {
    id: '2',
    name: 'Strawberry Milk',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50cdb36e7db2c2ca3681_Shop-product-cup_2.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50c4e61989bc963cf1b1_Shop-product-back_1.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50d598cd58638dbad73d_pieces.png',
    color: '#d94b59',
    textColor: '#fff',
    path: '/product/strawberry-milk'
  },
  {
    id: '3',
    name: 'Cookies & Cream',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/6784f8dd4cf9446e5030563d_cookies%26Cream_card_cup.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/6784f6be638ec0f46af1327d_cookies%26Cream_card_back.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/67c5bb342320ea03fe81283a_558_pieces-1.webp',
    color: '#439be4',
    textColor: '#fff',
    path: '/product/cookies-cream'
  },
  {
    id: '4',
    name: 'Peanut Butter Chocolate',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/6784fc2b1b4361681f540c65_Peanutbutterchocolate_card_cup.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/6784fc2634f4e82d81ad8d7b_Peanut%20butter%20chocolate_card_back.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/6784fce5478942b1f4c98048_Peanut%20butter%20chocolate_card_additional.webp',
    color: '#eca049',
    textColor: '#fff',
    path: '/product/peanut-butter-chocolate'
  },
  {
    id: '5',
    name: 'Vanilla Milkshake',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50b22ad7e046f421bf69_Shop-product-cup_3.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e5034822e237fb9f89d3f_Shop-product-back_3.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e503f244fae7c3bd61131_pieces.png',
    color: '#e8d5a3',
    textColor: '#a08040',
    path: '/product/vanilla-milkshake'
  },
  {
    id: '6',
    name: 'Max Chocolate Milk',
    image: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50f26a9a9b40ec9058de_Shop-product-cup_4.webp',
    backImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50e5c4d66d476164b4ae_Shop-product-back_4.svg',
    piecesImage: 'https://cdn.prod.website-files.com/6707999f0e8f3bdab42cb624/670e50f43ac4bddacd084a9f_pieces.png',
    color: '#2b1b14',
    textColor: '#fff',
    path: '/product/max-chocolate-milk'
  }
];

const ProductCard = ({ product }: { product: typeof products[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLImageElement>(null);
  const piecesRef = useRef<HTMLImageElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const can = canRef.current;
    const pieces = piecesRef.current;
    const cta = ctaRef.current;
    if (!card || !can || !pieces || !cta) return;

    gsap.set(pieces, { opacity: 0, scale: 0.7, y: 20 });
    gsap.set(cta, { opacity: 0, y: 20 });

    const onEnter = () => {
      gsap.to(can, { rotate: -4, scale: 1.08, y: -12, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(pieces, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)', overwrite: 'auto' });
      gsap.to(cta, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.05, overwrite: 'auto' });
    };

    const onLeave = () => {
      gsap.to(can, { rotate: 0, scale: 1, y: 0, duration: 0.5, ease: 'power3.inOut', overwrite: 'auto' });
      gsap.to(pieces, { opacity: 0, scale: 0.7, y: 20, duration: 0.35, ease: 'power3.in', overwrite: 'auto' });
      gsap.to(cta, { opacity: 0, y: 20, duration: 0.3, ease: 'power3.in', overwrite: 'auto' });
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className="shop-card relative flex flex-col overflow-hidden rounded-2xl cursor-pointer" style={{ backgroundColor: product.color, aspectRatio: '3 / 4' }}>
      <img src={product.backImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" draggable={false} />
      <img ref={piecesRef} src={product.piecesImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[3]" draggable={false} />
      <div className="relative z-10 px-4 md:px-6 pt-5 md:pt-7">
        <h3 className="font-black uppercase leading-tight tracking-tight" style={{ color: product.textColor, fontSize: 'clamp(1rem, 3.5vw, 2rem)', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          {product.name}
        </h3>
      </div>
      <div className="relative z-[4] flex-1 flex items-end justify-center pb-10">
        <img ref={canRef} src={product.image} alt={product.name} className="object-contain drop-shadow-2xl select-none" style={{ height: '72%', maxHeight: '360px', width: 'auto', transformOrigin: 'bottom center' }} draggable={false} />
      </div>
      <div ref={ctaRef} className="absolute bottom-5 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <span className="px-8 py-3 rounded-full bg-white/95 text-[#3e2a21] font-bold text-sm tracking-widest uppercase shadow-xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          Shop in store
        </span>
      </div>
    </div>
  );
};

const ShopPage = () => {
  return (
    <div className="bg-[#f5ebe0] min-h-screen text-[#3e2a21] font-sans overflow-x-hidden">
      <Navbar />
      <section className="pb-10 overflow-hidden pt-24">
        <style>{`
          @keyframes shop-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .shop-marquee-inner { display: flex; width: max-content; animation: shop-marquee 25s linear infinite; }
        `}</style>
        <div className="shop-marquee-inner">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="font-black uppercase whitespace-nowrap mx-6 tracking-tighter" style={{ fontSize: 'clamp(8rem, 18vw, 18rem)', lineHeight: 0.85, color: '#3e2a21' }}>
              EXPLORE <span style={{ color: '#d89945' }}>FULL</span> COLLECTION
            </span>
          ))}
        </div>
        <p className="max-w-2xl mx-auto text-center text-lg font-medium opacity-70 mt-10 px-6">
          Browse all our bold and delicious flavors, ready to fuel your next adventure. Discover your favorite today!
        </p>
      </section>

      <section className="px-3 md:px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="pt-20">
        <TestimonialSection />
      </div>
      <div className="pt-12">
        <FooterSection />
      </div>
    </div>
  );
};

export default ShopPage;
