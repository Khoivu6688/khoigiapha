{/* --- 2. CỤM NÚT BẤM (CHỒNG LÊN ẢNH - ĐÃ ĐẨY CAO HƠN) --- */}
        <motion.div
          className="
            flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 relative 
            -mt-20 sm:-mt-28     /* TĂNG GIÁ TRỊ ÂM: Nút sẽ nhảy lên cao hơn nữa */
            z-20                /* Giữ nút luôn nằm trên ảnh */
          "
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Vệt sáng trắng phía sau để tách biệt nút khỏi nội dung ảnh */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-24 bg-white/50 blur-3xl rounded-full z-0"></div>

          {/* Nút Đăng nhập Admin */}
          <motion.div variants={fadeIn} className="w-full sm:w-auto z-10">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full"
            >
              Đăng nhập Admin
              <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Nút Xem gia phả (Guest) */}
          <motion.div variants={fadeIn} className="w-full sm:w-auto z-10">
            <button
              onClick={handleGuestLogin}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-amber-900 bg-white/80 backdrop-blur-md border border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full"
            >
              Xem gia phả
              <Users className="size-5 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
