import { useStore } from '../store';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useStore();

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm transition-opacity"
        onClick={toggleCart}
      />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[9999] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">

        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-black text-[#3e2a21] uppercase tracking-tighter">Your Cart</h2>
          <button onClick={toggleCart} className="text-gray-500 hover:text-black">
            <i className="ri-close-line text-3xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <i className="ri-shopping-cart-line text-6xl mb-4"></i>
              <p className="text-xl font-bold">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border border-gray-100 p-3 rounded-2xl shadow-sm">
                <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex justify-center items-center p-2">
                  <img src={item.image} alt={item.name} className="h-full object-contain" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[#3e2a21] leading-tight text-sm uppercase max-w-[140px]">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex justify-center items-center rounded-full hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex justify-center items-center rounded-full hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-black text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-600">Subtotal</span>
              <span className="text-3xl font-black text-[#3e2a21]">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={toggleCart}
              className="w-full block text-center py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;