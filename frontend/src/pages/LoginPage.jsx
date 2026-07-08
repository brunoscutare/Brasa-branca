export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E7D7C1]">
            <div className="w-96 bg-[#24150E] rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
                <h1 className="text-3xl font-bold text-center text-[#FAF3E7]">
                    Brasa Branca
                </h1>
                <p className="text-center text-[#D6BFA5] text-sm">
                    Acesse sua conta
                </p>
                <input
                    className="w-full px-4 py-3 bg-[#FAF3E7] border border-[#8B4513] rounded-lg text-[#24150E] placeholder:text-[#8B7B70] outline-none focus:ring-2 focus:ring-[#8B4513]"
                    placeholder="Digite seu email"
                    type="email"
                />
                <input
                    className=" w-full px-4 py-3 bg-[#FAF3E7] border border-[#8B4513] rounded-lg text-[#24150E]  placeholder:text-[#8B7B70] outline-none focus:ring-2 focus:ring-[#8B4513]"
                    placeholder="Digite sua senha"
                    type="password"
                />
                <button
                    className="w-full bg-[#8B4513] text-[#FAF3E7] py-3 rounded-lg font-semibold hover:bg-[#6F370F] transition cursor-pointer"
                >
                    Entrar
                </button>
            </div>
        </div>
    );
}