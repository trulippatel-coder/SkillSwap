import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        skillsToTeachCount: 0,
        skillsToLearnCount: 0,
        matchesCount: 0,
        pendingRequestsCount: 0,
        upcomingSessionsCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadDashboard() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/api/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                setUser(data.user);
                if (data.stats) {
                    setStats(data.stats);
                } else {
                    setStats({
                        skillsToTeachCount: data.user?.skillsToTeach?.length || 0,
                        skillsToLearnCount: data.user?.skillsToLearn?.length || 0,
                        matchesCount: 0,
                        pendingRequestsCount: 0,
                        upcomingSessionsCount: 0
                    });
                }
                setLoading(false);
            } catch (err) {
                setError("Could not connect to the server.");
                setLoading(false);
            }
        }

        loadDashboard();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-md mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                                Student Learning Dashboard
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
                                {user ? `Welcome back, ${user.name}! 👋` : "Welcome back! 👋"}
                            </h1>
                            <p className="text-indigo-100 text-sm sm:text-base mt-2 max-w-xl">
                                Discover campus peers, exchange valuable skills, and manage your learning sessions all in one place.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to="/matches"
                                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm whitespace-nowrap"
                            >
                                🎯 View Matches
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Real Statistics Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📊</span> Your Activity & Overview
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Skills You Teach */}
                        <div
                            onClick={() => navigate("/profile")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300"
                        >
                            <div className="flex items-center justify-between text-indigo-600 mb-2">
                                <span className="text-2xl">💡</span>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Teach</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">
                                {stats.skillsToTeachCount}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                                Skills You Teach
                            </p>
                        </div>

                        {/* Skills You Want */}
                        <div
                            onClick={() => navigate("/profile")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300"
                        >
                            <div className="flex items-center justify-between text-purple-600 mb-2">
                                <span className="text-2xl">🎯</span>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Learn</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">
                                {stats.skillsToLearnCount}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                                Skills You Want
                            </p>
                        </div>

                        {/* Matches */}
                        <div
                            onClick={() => navigate("/matches")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300"
                        >
                            <div className="flex items-center justify-between text-green-600 mb-2">
                                <span className="text-2xl">⚡</span>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Matches</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">
                                {stats.matchesCount}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                                Skill Matches
                            </p>
                        </div>

                        {/* Pending Requests */}
                        <div
                            onClick={() => navigate("/requests")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300"
                        >
                            <div className="flex items-center justify-between text-amber-600 mb-2">
                                <span className="text-2xl">📨</span>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Requests</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">
                                {stats.pendingRequestsCount}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                                Pending Requests
                            </p>
                        </div>

                        {/* Upcoming Sessions */}
                        <div
                            onClick={() => navigate("/sessions")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300"
                        >
                            <div className="flex items-center justify-between text-blue-600 mb-2">
                                <span className="text-2xl">📅</span>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessions</span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">
                                {stats.upcomingSessionsCount}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                                Upcoming Sessions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (All 5 specified in requirements) */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🚀</span> Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* 1. Find Students */}
                        <div
                            onClick={() => navigate("/students")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-3">
                                    🔍
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    Find Students
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    Browse all student profiles and discover peer talents.
                                </p>
                            </div>
                            <span className="text-indigo-600 text-xs font-bold mt-4 inline-block">
                                Explore →
                            </span>
                        </div>

                        {/* 2. View Matches */}
                        <div
                            onClick={() => navigate("/matches")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl mb-3">
                                    🎯
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    View Matches
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    See students teaching the skills you want to learn.
                                </p>
                            </div>
                            <span className="text-indigo-600 text-xs font-bold mt-4 inline-block">
                                View matches →
                            </span>
                        </div>

                        {/* 3. View Requests */}
                        <div
                            onClick={() => navigate("/requests")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-3">
                                    📨
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    View Requests
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    Check and respond to your incoming and sent swap requests.
                                </p>
                            </div>
                            <span className="text-indigo-600 text-xs font-bold mt-4 inline-block">
                                Manage requests →
                            </span>
                        </div>

                        {/* 4. View Sessions */}
                        <div
                            onClick={() => navigate("/sessions")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-3">
                                    📅
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    View Sessions
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    Track scheduled, completed, and upcoming peer sessions.
                                </p>
                            </div>
                            <span className="text-indigo-600 text-xs font-bold mt-4 inline-block">
                                Open calendar →
                            </span>
                        </div>

                        {/* 5. Edit Profile */}
                        <div
                            onClick={() => navigate("/profile")}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer hover:border-indigo-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-3">
                                    ⚙️
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    Edit Profile
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    Update your bio, location, and teaching or desired skills.
                                </p>
                            </div>
                            <span className="text-indigo-600 text-xs font-bold mt-4 inline-block">
                                Update profile →
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Skills Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills You Teach */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span>💡</span> Skills You Teach
                            </h3>
                            <Link
                                to="/profile"
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                Edit
                            </Link>
                        </div>
                        {user?.skillsToTeach?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.skillsToTeach.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-xs font-semibold"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <p className="text-gray-500 text-xs mb-3">
                                    You haven't listed any skills you can teach yet.
                                </p>
                                <Link
                                    to="/profile"
                                    className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                                >
                                    Add Teaching Skills
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Skills You Want to Learn */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span>🎯</span> Skills You Want to Learn
                            </h3>
                            <Link
                                to="/profile"
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                Edit
                            </Link>
                        </div>
                        {user?.skillsToLearn?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.skillsToLearn.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-lg text-xs font-semibold"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <p className="text-gray-500 text-xs mb-3">
                                    List what you want to learn to get automatic matches.
                                </p>
                                <Link
                                    to="/profile"
                                    className="bg-purple-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                                >
                                    Add Learning Wishlist
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;