function Hero() {
    return (
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">

            <div className="max-w-7xl mx-auto px-6 py-24 text-center">

                <div className="max-w-3xl mx-auto">

                    {/* Small heading */}

                    <p className="text-indigo-200 font-semibold uppercase tracking-wider mb-4">
                        Learn • Teach • Connect
                    </p>


                    {/* Main heading */}

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">

                        Learn New Skills.
                        <br />

                        <span className="text-indigo-200">
                            Share What You Know.
                        </span>

                    </h1>


                    {/* Description */}

                    <p className="text-lg md:text-xl text-indigo-100 mb-10">

                        SkillSwap connects students who want to learn
                        with students who are ready to teach.

                        Exchange knowledge, build skills,
                        and grow together.

                    </p>


                    {/* Buttons */}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">

                        <a
                            href="/register"
                            className="bg-white text-indigo-600 px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Get Started →
                        </a>


                        <a
                            href="/students"
                            className="border border-white px-7 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
                        >
                            Explore Students
                        </a>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Hero;