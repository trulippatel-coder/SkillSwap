import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        setIsLoggedIn(!!token);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
        setMobileMenuOpen(false);
        navigate("/login");
    }

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `text-sm font-medium transition px-3 py-2 rounded-lg ${
            isActive(path)
                ? "text-indigo-600 bg-indigo-50 font-semibold"
                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
        }`;

    const mobileLinkClass = (path) =>
        `block text-base font-medium px-4 py-2.5 rounded-lg transition ${
            isActive(path)
                ? "text-indigo-600 bg-indigo-50 font-semibold"
                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
        }`;

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                {/* Brand Logo */}
                <Link
                    to={isLoggedIn ? "/dashboard" : "/"}
                    className="flex items-center gap-2 text-2xl font-bold text-indigo-600 tracking-tight hover:opacity-90 transition"
                >
                    <span className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-extrabold shadow-sm">
                        ⚡
                    </span>
                    <span>SkillSwap</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                                Dashboard
                            </Link>

                            <Link to="/students" className={navLinkClass("/students")}>
                                Find Students
                            </Link>

                            <Link to="/matches" className={navLinkClass("/matches")}>
                                Matches
                            </Link>

                            <Link to="/requests" className={navLinkClass("/requests")}>
                                Requests
                            </Link>

                            <Link to="/sessions" className={navLinkClass("/sessions")}>
                                Sessions
                            </Link>

                            <Link to="/profile" className={navLinkClass("/profile")}>
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className={navLinkClass("/")}>
                                Home
                            </Link>

                            <Link to="/students" className={navLinkClass("/students")}>
                                Find Students
                            </Link>

                            <Link to="/login" className={navLinkClass("/login")}>
                                Login
                            </Link>
                        </>
                    )}
                </nav>

                {/* Desktop Action Buttons */}
                <div className="hidden lg:flex items-center gap-3">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            {user?.name && (
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                    👤 {user.name}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
                            >
                                Register Free
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition focus:outline-none"
                    aria-label="Toggle Navigation Menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <span className="text-2xl font-bold leading-none">✕</span>
                    ) : (
                        <span className="text-2xl font-bold leading-none">☰</span>
                    )}
                </button>
            </div>

            {/* Mobile Navigation Drawer / Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-fadeIn">
                    {isLoggedIn && user?.name && (
                        <div className="px-4 py-2 mb-2 bg-indigo-50/70 rounded-lg flex items-center justify-between text-xs text-indigo-900 font-medium">
                            <span>Signed in as</span>
                            <span className="font-bold">{user.name}</span>
                        </div>
                    )}

                    {isLoggedIn ? (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/dashboard")}
                            >
                                📊 Dashboard
                            </Link>

                            <Link
                                to="/students"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/students")}
                            >
                                🔍 Find Students
                            </Link>

                            <Link
                                to="/matches"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/matches")}
                            >
                                🎯 Matches
                            </Link>

                            <Link
                                to="/requests"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/requests")}
                            >
                                📨 Requests
                            </Link>

                            <Link
                                to="/sessions"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/sessions")}
                            >
                                📅 Sessions
                            </Link>

                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/profile")}
                            >
                                👤 Profile
                            </Link>

                            <div className="pt-3 border-t border-gray-100 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left text-red-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-red-50 transition"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/")}
                            >
                                🏠 Home
                            </Link>

                            <Link
                                to="/students"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/students")}
                            >
                                🔍 Find Students
                            </Link>

                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass("/login")}
                            >
                                🔑 Login
                            </Link>

                            <div className="pt-2">
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    ✨ Register Free
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

export default Navbar;