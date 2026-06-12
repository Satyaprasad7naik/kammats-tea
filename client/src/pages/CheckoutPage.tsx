import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FooterSection from '../sections/FooterSection';
import { useStore } from '../store';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, clearCart } = useStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    clearCart();
  };

  if (isSuccess) {
    return (
      <div className="bg-[#f5ebe0] min-h-screen text-[#3e2a21] flex flex-col justify-center items-center">
        <Navbar />
        <div className="bg-white p-12 rounded-[2vw] text-center shadow-xl max-w-lg mt-20">
          <i className="ri-checkbox-circle-fill text-6xl text-green-500 mb-4 block"></i>
          <h1 className="text-4xl font-black mb-4 uppercase">Order Confirmed!</h1>
          <p className="text-lg opacity-80 mb-8">Thank you for your purchase. Your SpyltMilk is on the way.</p>
          <Link to="/shop" className="px-10 py-4 rounded-full bg-black text-white font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#f5ebe0] min-h-screen flex flex-col justify-center items-center text-[#3e2a21]">
        <Navbar />
        <div className="mt-32 text-center">
          <i className="ri-shopping-cart-line text-6xl mb-4 block opacity-50"></i>
          <h1 className="text-4xl font-black mb-4">Your Cart is Empty</h1>
          <Link to="/shop" className="px-8 py-3 mt-6 inline-block rounded-full bg-[#d89945] text-white font-bold uppercase tracking-wide hover:bg-amber-600 transition">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5ebe0] min-h-screen text-[#3e2a21] font-sans overflow-x-hidden">
      <Navbar />

      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

        {/* Checkout Form */}
        <div className="w-full lg:w-2/3 bg-white p-8 md:p-12 rounded-[2vw] shadow-lg">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b pb-6">Secure Checkout</h1>

          <form onSubmit={handleCheckout} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <input required type="email" placeholder="Email" className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 mt-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="First Name" className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
                <input required type="text" placeholder="Last Name" className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
                <input required type="text" placeholder="Address" className="w-full p-4 border rounded-xl bg-gray-50 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
                <input required type="text" placeholder="City" className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
                <input required type="text" placeholder="Postal Code" className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#d89945]" />
              </div>
            </div>

            <button type="submit" className="mt-8 w-full py-5 bg-black text-white rounded-full font-bold text-lg uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-xl">
              Pay ₹{totalAmount.toFixed(2)}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-[#faeade] p-8 rounded-[2vw] sticky top-32">
            <h2 className="text-2xl font-black uppercase mb-6">Order Summary</h2>

            <div className="flex flex-col gap-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex justify-center items-center">
                      <img src={item.image} alt={item.name} className="h-10 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm max-w-[120px] truncate">{item.name}</h4>
                      <p className="text-xs opacity-70">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#3e2a21]/20 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="opacity-80">Subtotal</span>
                <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="opacity-80">Shipping</span>
                <span className="font-bold">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-black uppercase">Total</span>
                <span className="font-black text-3xl">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default CheckoutPage;