function PopularSkills() {

    const skills = [
        {
            icon: "💻",
            title: "Programming",
            skills: "C, C++, Java, Python, JavaScript"
        },
        {
            icon: "🌐",
            title: "Web Development",
            skills: "HTML, CSS, React, Node.js"
        },
        {
            icon: "🎨",
            title: "Design",
            skills: "UI/UX, Figma, Photoshop"
        },
        {
            icon: "🎤",
            title: "Communication",
            skills: "English, Public Speaking, Presentation"
        }
    ];

    return (
        <section className="py-20 bg-white">

            <div className="max-w-7xl mx-auto px-6">

                {/* Heading */}

                <div className="text-center mb-12">

                    <p className="text-indigo-600 font-semibold mb-2">
                        EXPLORE
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Popular Skills
                    </h2>

                </div>


                {/* Skill Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {skills.map((skill) => (

                        <article
                            key={skill.title}
                            className="p-6 bg-gray-50 rounded-xl
                                       border border-gray-200
                                       hover:shadow-lg hover:-translate-y-1
                                       transition"
                        >

                            <div className="text-4xl mb-5">
                                {skill.icon}
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {skill.title}
                            </h3>

                            <p className="text-gray-600 leading-relaxed">
                                {skill.skills}
                            </p>

                        </article>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default PopularSkills;