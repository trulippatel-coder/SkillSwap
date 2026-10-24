function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Create Your Profile",
            description:
                "Create your student profile and tell the community about your interests and skills."
        },
        {
            number: "02",
            title: "Add Your Skills",
            description:
                "Add the skills you can teach and the skills you want to learn."
        },
        {
            number: "03",
            title: "Find Your Match",
            description:
                "Discover students whose skills match your learning requirements."
        },
        {
            number: "04",
            title: "Start Learning",
            description:
                "Connect with your match, exchange knowledge, and grow together."
        }
    ];

    return (
        <section className="py-20 bg-gray-50">

            <div className="max-w-7xl mx-auto px-6">

                {/* Section heading */}

                <div className="text-center max-w-2xl mx-auto mb-12">

                    <p className="text-indigo-600 font-semibold mb-2">
                        HOW IT WORKS
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Learn From Each Other
                    </h2>

                    <p className="text-gray-600">
                        SkillSwap makes peer-to-peer learning
                        simple, collaborative, and accessible.
                    </p>

                </div>


                {/* Steps */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {steps.map((step) => (

                        <article
                            key={step.number}
                            className="bg-white p-6 rounded-xl border border-gray-200
                                       hover:shadow-lg transition"
                        >

                            {/* Number */}

                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600
                                            rounded-lg flex items-center justify-center
                                            font-bold text-lg mb-5">

                                {step.number}

                            </div>


                            {/* Title */}

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {step.title}
                            </h3>


                            {/* Description */}

                            <p className="text-gray-600 leading-relaxed">
                                {step.description}
                            </p>

                        </article>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default HowItWorks;