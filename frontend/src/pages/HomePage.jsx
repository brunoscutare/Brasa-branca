export default function HomePage() {
    return (
        <main className="min-h-screen text-[#6F370F]">
            <section
                id="inicio"
                className="flex min-h-screen items-center justify-center px-6 pt-28"
            >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-center">
                    <p className="text-sm uppercase tracking-[0.4em] text-[#5B3418]">
                        Brasa Branca
                    </p>
                    <h1 className="text-5xl font-semibold leading-tight text-[#5B3418] md:text-7xl">
                        Bem-vindo à sua experiência gastronômica.
                    </h1>
                </div>
            </section>

            <section
                id="cardapio"
                className="min-h-screen scroll-mt-28 border-t border-[#8B4513]/12 px-6 py-24"
            >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
                    <div className="max-w-2xl">
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                            Cardápio
                        </p>
                        <h2 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">
                            Veja os pratos logo abaixo da apresentação.
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <article className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-[#5B3418]">Prato 1</h3>
                            <p className="mt-3 text-sm leading-6 text-[#7A4A2A]">
                                Espaço reservado para os itens do cardápio quando você montar a lista real.
                            </p>
                        </article>
                        <article className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-[#5B3418]">Prato 2</h3>
                            <p className="mt-3 text-sm leading-6 text-[#7A4A2A]">
                                A seção já fica posicionada para receber seus cards, imagens e preços.
                            </p>
                        </article>
                        <article className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:col-span-2 xl:col-span-1">
                            <h3 className="text-xl font-semibold text-[#5B3418]">Prato 3</h3>
                            <p className="mt-3 text-sm leading-6 text-[#7A4A2A]">
                                Quando você criar os itens de verdade, basta trocar este conteúdo.
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
}