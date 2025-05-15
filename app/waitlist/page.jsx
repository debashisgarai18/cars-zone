"use client";
import React, { useState, useEffect } from "react";

function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [openQuestion, setOpenQuestion] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    const fetchCarImage = async () => {
      try {
        const response = await fetch("/api/pexels-random-image-generator", {
          method: "POST",
          body: JSON.stringify({
            query: "luxury car dark",
            targetWidth: 1920,
            targetHeight: 1080,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }
        const data = await response.json();
        if (data.url) {
          setBackgroundImage(data.url);
        }
      } catch (err) {
        console.error("Error fetching background image:", err);
      }
    };
    fetchCarImage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/db/waitlist-entries", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `waitlist` (`email`, `signup_date`) VALUES (?, ?)",
          values: [email, new Date().toISOString()],
        }),
      });
      setSubmitted(true);
      setEmail("");
      setError("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-fit dotted-background flex flex-col relative overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      <nav className="fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-[#EFEFED] text-3xl font-poppins">
                Car<span className="text-[#EFEFED]">Zone</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-24 relative z-10">
        <div className="max-w-3xl mx-auto w-full">
          <div className="p-8 md:p-12 bg-[#0d0f13] rounded-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#EFEFED] font-poppins mb-8">
              The future of car buying is <span className="font-semibold md:font-extrabold">coming soon</span>.
            </h1>
            <p className="text-lg text-[#9C9FA4] font-poppins mb-8">
              Experience a revolutionary way to buy and sell cars. Our platform
              connects car enthusiasts, dealers, and private sellers in one
              seamless marketplace, making car transactions easier than ever.
            </p>
            <div className="flex items-center space-x-2 mb-8">
              <div className="h-px flex-1 bg-[#262A36]"></div>
              <p className="text-lg font-poppins text-[#EFEFED]">
                Join the waitlist to get early access 🚗
              </p>
              <div className="h-px flex-1 bg-[#262A36]"></div>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 pr-36 rounded-lg bg-[#20242F] border border-[#262A36] text-[#EFEFED] placeholder-[#9C9FA4] focus:outline-none focus:border-[#EFEFED]"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 cursor-pointer -translate-y-1/2 bg-[#171B26] text-[#EFEFED] py-2 px-4 rounded-lg border border-[#262A36] hover:bg-[#20242F]"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Launch</span>
                      <i className="far fa-arrow-right"></i>
                    </span>
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </form>
            ) : (
              <div className="bg-[#20242F] border border-[#262A36] text-[#EFEFED] p-8 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <i className="far fa-check text-2xl text-[#EFEFED]"></i>
                  <h3 className="text-2xl font-poppins">You're on the list!</h3>
                </div>
                <p className="text-[#9C9FA4]">
                  Thanks for joining! We'll keep you updated on all the exciting
                  developments.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 bg-[#0d0f13] rounded-lg p-8">
            <h2 className="text-xl font-poppins text-[#EFEFED] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What is CarZone?",
                  a: "CarZone is a modern car marketplace that connects buyers and sellers, offering a seamless platform for car transactions with advanced features and user-friendly experience.",
                },
                {
                  q: "How does it work?",
                  a: "Our platform will allow you to list, browse, and purchase vehicles with ease. Whether you're a private seller or dealer, you'll have access to powerful tools to make car transactions simple.",
                },
                {
                  q: "When will it launch?",
                  a: "We're currently in development and will launch soon. Join our waitlist to be among the first to access the platform and receive exclusive early-bird benefits.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="border border-[#262A36] rounded-lg p-4 hover:bg-[#20242F]"
                >
                  <button
                    onClick={() =>
                      setOpenQuestion(openQuestion === index ? null : index)
                    }
                    className="w-full cursor-pointer flex justify-between items-center text-[#EFEFED] font-poppins"
                  >
                    <span>{faq.q}</span>
                    <i
                      className={`far fa-chevron-down transition-transform ${
                        openQuestion === index ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  <div
                    className={`mt-4 transition-all duration-300 ease-in-out ${
                      openQuestion === index
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <p className="text-[#9C9FA4]">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <footer className="fixed bottom-0 z-10 w-full py-6 px-6 md:px-20 bg-[#171B26] border-t border-[#262A36]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-6">
            <a href="#" className="text-[#9C9FA4] hover:text-[#EFEFED]">
              <i className="far fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-[#9C9FA4] hover:text-[#EFEFED]">
              <i className="far fa-instagram text-xl"></i>
            </a>
            <a href="#" className="text-[#9C9FA4] hover:text-[#EFEFED]">
              <i className="far fa-linkedin text-xl"></i>
            </a>
          </div>
          <p className="text-[#9C9FA4] font-poppins text-sm">
            © 2024 CarZone. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default Waitlist;
