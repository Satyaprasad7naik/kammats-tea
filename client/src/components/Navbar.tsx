import React, { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { getImage } from '../utils/media';
import NavMenu from "./NavMenu";
import { useStore } from '../store';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toggleCart, cart } = useStore();

    useGSAP(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>(".nav-logo, .menu-hover"));
        if (!els.length) return;

        const disposers: Array<() => void> = [];

        els.forEach((el) => {
            const onMove = (e: MouseEvent) => {
                const b = el.getBoundingClientRect();
                const x = e.clientX - b.left;
                const y = e.clientY - b.top;
                const offsetX = (x / b.width - 0.5) * 10; // ±5px
                const offsetY = (y / b.height - 0.5) * 10; // ±5px
                gsap.to(el, { x: offsetX, y: offsetY, scale: 1.2, duration: 0.25, ease: "power2.out" });
            };

            const onLeave = () => gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });

            el.addEventListener("mousemove", onMove);
            el.addEventListener("mouseleave", onLeave);

            disposers.push(() => {
                el.removeEventListener("mousemove", onMove);
                el.removeEventListener("mouseleave", onLeave);
            });
        });

        return () => disposers.forEach((d) => d());
    });

    return (
        <>
            <nav className="fixed top-0 left-0 z-50 flex items-center justify-between md:p-6 p-3 w-full bg-transparent">
                <Link to="/">
                    <img
                        src={getImage("nav-logo.svg")}
                        alt="navbar-logo"
                        className="md:w-18 w-20 nav-logo"
                    />
                </Link>

                <div className="flex gap-4 items-center">
                    <div className="px-6 py-2 bg-[#f3e2d5] rounded-3xl hover:bg-[#e9aa56] text-center hidden md:block">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#523122] text-sm font-semibold p-0 m-0">
                            FIND STORES
                        </a>
                    </div>
                    <button
                        onClick={toggleCart}
                        className="relative w-12 h-12 bg-black rounded-full flex justify-center items-center hover:bg-gray-800 transition-colors"
                    >
                        <i className="ri-shopping-cart-2-line text-white text-xl"></i>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* NavMenu receives isOpen */}
            <div
                className="p-1 backdrop-blur-xl rounded-full menu-hover inline-block cursor-pointer fixed top-6 left-1/2 transform -translate-x-1/2 z-[1000]"

                onClick={() => setIsMenuOpen((prev) => !prev)}
            >
                {isMenuOpen ? (
                    <i className="ri-close-fill text-[#523122] text-2xl"></i>
                ) : (
                    <i className="ri-menu-5-line text-[#523122] text-2xl"></i>
                )}
            </div>
            <NavMenu isOpen={isMenuOpen} />
        </>
    );
};

export default Navbar;