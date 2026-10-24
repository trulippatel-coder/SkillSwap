function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">

            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Brand */}

                    <div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            SkillSwap
                        </h2>

                        <p className="text-gray-400 leading-relaxed">
                            A student-powered platform for learning,
                            teaching, and sharing skills.
                        </p>

                    </div>


                    {/* Quick Links */}

                    <div>

                        <h3 className="text-white font-semibold mb-4">
                            Quick Links
                        </h3>

                        <div className="flex flex-col gap-3">

                            <a
                                href="/"
                                className="hover:text-white transition"
                            >
                                Home
                            </a>

                            <a
                                href="/students"
                                className="hover:text-white transition"
                            >
                                Find Students
                            </a>

                            <a
                                href="/matches"
                                className="hover:text-white transition"
                            >
                                Skill Matches
                            </a>

                        </div>

                    </div>


                    {/* Account */}

                    <div>

                        <h3 className="text-white font-semibold mb-4">
                            Account
                        </h3>

                        <div className="flex flex-col gap-3">

                            <a
                                href="/login"
                                className="hover:text-white transition"
                            >
                                Login
                            </a>

                            <a
                                href="/register"
                                className="hover:text-white transition"
                            >
                                Register
                            </a>

                        </div>

                    </div>

                </div>


                {/* Copyright */}

                <div className="border-t border-gray-700 mt-10 pt-6 text-center">

                    <p className="text-sm text-gray-500">
                        © 2026 SkillSwap. All rights reserved.
                    </p>

                </div>

            </div>

        </footer>
    );
}

export default Footer;