function Banner() {
  return (
    <section className="font-montserrat bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="px-6 flex flex-col md:flex-row items-center justify-between min-h-[80vh]">
          <div className="flex flex-col items-start justify-center max-w-xl">
            <h1 className="text-5xl md:text-7xl font-semibold mb-4 font-playfair text-gray-800 leading-tight">
              Craft the Future <span className="text-[#3E8DE3] text-8xl">OF</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-gray-700 mb-6">
              Design, customize, and create stunning 3D woolen toys and
              decoratives with our advanced AI-powered studio. The future of
              crafting is here.
            </p>
            <a
              href="/gallery"
              className="flex justify-center items-center px-6 py-3 gap-4 bg-gradient-to-l from-[#52B0FF] to-[#3E8DE3] rounded-2xl text-white font-medium shadow-lg hover:opacity-90 transition"
            >
              Get Started With 3D Studio
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>

          <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
            <img
              src="src/assets/images/banner_img.png"
              alt="Wool Toy"
              className="w-full max-w-lg drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
