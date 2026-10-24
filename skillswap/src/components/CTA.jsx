function CTA() {
    return (
        <section className="py-20 bg-indigo-600 text-white">

            <div className="max-w-4xl mx-auto px-6 text-center">

                <h2 className="text-3xl md:text-4xl font-bold mb-5">
                    Ready to Share Your Skills?
                </h2>

                <p className="text-lg text-indigo-100 mb-8">
                    Join SkillSwap and start learning from other students
                    while sharing what you already know.
                </p>

                <a
                    href="/register"
                    className="inline-block bg-white text-indigo-600
                               px-7 py-3 rounded-lg font-semibold
                               hover:bg-gray-100 transition"
                >
                    Create Your Profile →
                </a>

            </div>

        </section>
    );
}

export default CTA;