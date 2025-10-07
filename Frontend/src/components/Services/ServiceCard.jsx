import { useState } from "react";

// ✅ Import all images properly
import service1 from "../../assets/images/service1.jpg";
import service2 from "../../assets/images/service2.jpg";
import threeD from "../../assets/images/3d.jpg";
import digitalArtist from "../../assets/images/digital_artist_male.jpg";

const slides = [
  {
    img: service1,
    title: "AI-Powered Design",
    desc: "Generate unique woolen patterns and designs using advanced machine learning algorithms",
  },
  {
    img: service2,
    title: "Real-time 3D Rendering",
    desc: "See your changes instantly with our high-performance 3D rendering engine.",
  },
  {
    img: threeD,
    title: "Text-to-Model",
    desc: "Describe your vision and watch as AI creates a 3D model from your words.",
  },
  {
    img: digitalArtist,
    title: "Image-to-Model",
    desc: "Get AI assistance 3d Models using Images",
  },
];

function Services() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    if (index < slides.length - 1) setIndex(index + 1);
  };

  const prevSlide = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <section className="font-montserrat py-12 bg-[#ffff] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
            Next-Gen Features
          </h2>
          <p>Powered by cutting-edge AI and 3D technology</p>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-600 ease-in-out"
            style={{
              transform: `translateX(-${
                index * (window.innerWidth < 768 ? 100 : 100 / 3)
              }%)`,
            }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="w-full md:w-1/3 px-2 flex-shrink-0">
                <div className="relative group rounded-lg overflow-hidden shadow-lg cursor-pointer">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-5 py-3 w-[85%] shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg text-gray-800">
                        {slide.title}
                      </span>
                      <span className="text-xl inline-block transform transition-transform duration-500 group-hover:-rotate-45">
                        <i className="fa-solid fa-arrow-right"></i>
                      </span>
                    </div>
                    <div className="max-h-0 overflow-hidden transition-all duration-500 group-hover:max-h-20">
                      <p className="text-sm text-gray-600 mt-2">{slide.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={nextSlide}
            className="absolute cursor-pointer top-1/2 right-0 -translate-y-1/2 bg-gray-800 h-[40px] w-[40px] flex items-center justify-center text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-10"
          >
            <i className="fa-solid fa-arrow-right"></i>
          </button>

          {index > 0 && (
            <button
              onClick={prevSlide}
              className="absolute cursor-pointer top-1/2 left-0 -translate-y-1/2 bg-gray-800 text-white h-[40px] w-[40px] flex items-center justify-center p-3 rounded-full shadow-lg hover:bg-gray-700 z-10"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default Services;
