import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Matches() {
    const navigate = useNavigate();

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [requestError, setRequestError] = useState("");

    // Selected skill for each matched student
    const [selectedSkills, setSelectedSkills] = useState({});
    const [requestingId, setRequestingId] = useState(null);

    useEffect(() => {
        async function loadMatches() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/api/matches", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Failed to load matches.");
                    setLoading(false);
                    return;
                }

                setMatches(data.matches || []);

                // Pre-select the primary matching skill for each match
                const initialSelected = {};
                (data.matches || []).forEach((m) => {
                    if (m.matchingSkills && m.matchingSkills.length > 0) {
                        initialSelected[m.student._id] = m.matchingSkills[0];
                    } else if (m.student.skillsToTeach && m.student.skillsToTeach.length > 0) {
                        initialSelected[m.student._id] = m.student.skillsToTeach[0];
                    }
                });
                setSelectedSkills(initialSelected);

                setLoading(false);
            } catch (err) {
                setError("Could not connect to the server.");
                setLoading(false);
            }
        }

        loadMatches();
    }, [navigate]);

    async function handleRequest(studentId) {
        const token = localStorage.getItem("token");
        const skill = selectedSkills[studentId];

        if (!skill) {
            setRequestError("Please select a skill to request.");
            return;
        }

        setRequestingId(studentId);
        setRequestError("");
        setRequestMessage("");

        try {
            const response = await fetch("http://localhost:5001/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: studentId,
                    skill
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setRequestError(data.message || "Could not send swap request.");
                setRequestingId(null);
                return;
            }

            setRequestMessage(`Skill swap request for "${skill}" sent successfully!`);
            setRequestingId(null);
        } catch (err) {
            setRequestError("Could not connect to the server.");
            setRequestingId(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Finding your skill matches...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Skill Matches 🎯
                        </h1>
                        <p className="text-gray-600 mt-1.5">
                            Students who can teach the exact skills you want to learn.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to="/students"
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Browse All Students
                        </Link>
                        <Link
                            to="/profile"
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition"
                        >
                            Edit Desired Skills
                        </Link>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
                        <span>{error}</span>
                    </div>
                )}

                {requestError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        ⚠️ {requestError}
                    </div>
                )}

                {requestMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                        ✅ {requestMessage}
                    </div>
                )}

                {/* Empty State */}
                {matches.length === 0 && !error && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                            🎯
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No Skill Matches Found Yet
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We compare the skills you want to learn against what other students teach.
                            Make sure you have added skills you want to learn in your profile, or browse all students.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link
                                to="/profile"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                Update Skills to Learn
                            </Link>
                            <Link
                                to="/students"
                                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Explore All Students
                            </Link>
                        </div>
                    </div>
                )}

                {/* Matches Grid */}
                {matches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map(({ student, matchingSkills }) => (
                            <div
                                key={student._id}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div>
                                    {/* Match Badge Banner */}
                                    <div className="mb-4 bg-indigo-50/80 border border-indigo-100 rounded-xl p-3">
                                        <p className="text-xs uppercase tracking-wider font-bold text-indigo-700 mb-1">
                                            Matching Skill{matchingSkills.length > 1 ? "s" : ""}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {matchingSkills.map((mSkill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md shadow-xs"
                                                >
                                                    ✓ {mSkill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Student Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {student.name}
                                            </h2>
                                            {student.location ? (
                                                <p className="text-gray-500 text-xs mt-1">
                                                    📍 {student.location}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 text-xs mt-1">
                                                    Campus Student
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {student.bio ? (
                                        <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                                            {student.bio}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-sm italic mt-3">
                                            No bio provided.
                                        </p>
                                    )}

                                    {/* Skills They Teach */}
                                    <div className="mt-5">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                            Can Teach
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {student.skillsToTeach?.map((skill, index) => {
                                                const isMatch = matchingSkills.some(
                                                    (m) => m.toLowerCase() === skill.toLowerCase()
                                                );
                                                return (
                                                    <span
                                                        key={index}
                                                        className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                                                            isMatch
                                                                ? "bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold"
                                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                                        }`}
                                                    >
                                                        {skill}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Skills They Want to Learn */}
                                    {student.skillsToLearn && student.skillsToLearn.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                                Wants To Learn
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {student.skillsToLearn.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium px-2.5 py-1 rounded-md"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Request Skill Swap Form */}
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Select Skill to Learn:
                                    </label>
                                    <select
                                        value={selectedSkills[student._id] || ""}
                                        onChange={(e) =>
                                            setSelectedSkills({
                                                ...selectedSkills,
                                                [student._id]: e.target.value
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {student.skillsToTeach?.map((skill, index) => (
                                            <option key={index} value={skill}>
                                                {skill}{" "}
                                                {matchingSkills.some(
                                                    (m) => m.toLowerCase() === skill.toLowerCase()
                                                )
                                                    ? "(Matched)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => handleRequest(student._id)}
                                        disabled={requestingId === student._id}
                                        className="w-full mt-3 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                    >
                                        {requestingId === student._id ? "Sending Request..." : "Request Skill Swap"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Matches;
