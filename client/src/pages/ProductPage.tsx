import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterSection from '../sections/FooterSection';
import { products } from '../data/products';
import { useStore } from '../store';

const ProductPage = () => {
  const { id } = useParams(); // Using slug for SEO
  const product = products.find((p) => p.slug === id);
  const addToCart = useStore((state) => state.addToCart);

  if (!product) {
    return (
      <div className="bg-[#f5ebe0] min-h-screen flex flex-col justify-center items-center text-[#3e2a21]">
        <Navbar />
        <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
        <Link to="/shop" className="px-8 py-3 rounded-full bg-[#d89945] text-white font-bold">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  return (
    <div className="bg-[#f5ebe0] min-h-screen text-[#3e2a21] font-sans overflow-x-hidden">
      <Navbar />

      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        {/* Product Image Side */}
        <div
          className="w-full md:w-1/2 rounded-[2vw] relative p-10 flex justify-center items-center overflow-hidden min-h-[500px]"
          style={{ backgroundColor: product.color }}
        >
          <img src={product.backImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <img src={product.image} alt={product.name} className="relative z-10 h-[400px] object-contain drop-shadow-2xl" />
          <img src={product.piecesImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain z-[3]" />
        </div>

        {/* Product Info Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-4" style={{ color: product.color }}>
            {product.name}
          </h1>

          <p className="text-2xl font-bold mb-6">₹{product.price.toFixed(2)}</p>

          <p className="text-lg opacity-80 mb-10 max-w-md">
            {product.description}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="px-10 py-4 rounded-full bg-black text-white font-bold text-lg tracking-wider uppercase hover:bg-gray-800 transition-colors shadow-lg"
            >
              Add to Cart
            </button>
            <Link
              to="/shop"
              className="px-10 py-4 rounded-full border-2 border-black text-black font-bold text-lg tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ProductPage;