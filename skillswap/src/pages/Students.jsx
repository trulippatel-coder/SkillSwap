import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Students() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stores which student is currently receiving a request
    const [requestingId, setRequestingId] = useState(null);

    // Stores success/error messages for requests
    const [requestMessage, setRequestMessage] = useState("");
    const [requestError, setRequestError] = useState("");
    const [selectedSkills, setSelectedSkills] = useState({});

    // Filter search state
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadData() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                // Fetch students and current user profile in parallel
                const [studentsRes, profileRes] = await Promise.all([
                    fetch("http://localhost:5001/api/students", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch("http://localhost:5001/api/profile", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const studentsData = await studentsRes.json();
                const profileData = await profileRes.json();

                if (!studentsRes.ok) {
                    setError(studentsData.message || "Could not load students.");
                    setLoading(false);
                    return;
                }

                setStudents(studentsData.students || []);

                if (profileRes.ok && profileData.user) {
                    setCurrentUser(profileData.user);
                }

                // Initialize default selected skill for each student
                const initialSelected = {};
                (studentsData.students || []).forEach((s) => {
                    if (s.skillsToTeach && s.skillsToTeach.length > 0) {
                        initialSelected[s._id] = s.skillsToTeach[0];
                    }
                });
                setSelectedSkills(initialSelected);

                setLoading(false);
            } catch (err) {
                setError("Could not connect to the server.");
                setLoading(false);
            }
        }

        loadData();
    }, [navigate]);

    async function handleRequest(studentId) {
        const token = localStorage.getItem("token");
        const skill = selectedSkills[studentId];

        if (!skill) {
            setRequestError("Please select a skill before sending the request.");
            return;
        }

        setRequestingId(studentId);
        setRequestMessage("");
        setRequestError("");

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
                setRequestError(data.message || "Could not send request.");
                setRequestingId(null);
                return;
            }

            setRequestMessage(`Request to learn "${skill}" sent successfully!`);
            setRequestingId(null);
        } catch (err) {
            setRequestError("Could not connect to the server.");
            setRequestingId(null);
        }
    }

    // Helper to check if a student teaches any skill the current user wants to learn
    const userLearnSkillsLower = (currentUser?.skillsToLearn || []).map((s) =>
        s.trim().toLowerCase()
    );

    const filteredStudents = students.filter((student) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const matchesName = student.name?.toLowerCase().includes(term);
        const matchesLocation = student.location?.toLowerCase().includes(term);
        const matchesBio = student.bio?.toLowerCase().includes(term);
        const matchesTeach = student.skillsToTeach?.some((s) =>
            s.toLowerCase().includes(term)
        );
        const matchesLearn = student.skillsToLearn?.some((s) =>
            s.toLowerCase().includes(term)
        );
        return matchesName || matchesLocation || matchesBio || matchesTeach || matchesLearn;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading student community...</p>
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Find Students 🔍
                        </h1>
                        <p className="text-gray-600 mt-1.5">
                            Discover fellow campus learners and request skill exchange sessions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/matches"
                            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition flex items-center gap-2"
                        >
                            <span>🎯</span> View Exact Matches
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by student name, skill, or location..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        {error}
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
                {filteredStudents.length === 0 && !error && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
                        <div className="text-4xl mb-3">🎓</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {searchTerm ? "No students match your search" : "No other students found"}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">
                            {searchTerm
                                ? "Try searching for a different skill or name."
                                : "Other students will appear here as they register on SkillSwap."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-indigo-600 font-semibold text-sm hover:underline"
                            >
                                Reset Search
                            </button>
                        )}
                    </div>
                )}

                {/* Students Grid */}
                {filteredStudents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => {
                            const matchingSkills = (student.skillsToTeach || []).filter((skill) =>
                                userLearnSkillsLower.includes(skill.trim().toLowerCase())
                            );
                            const hasMatch = matchingSkills.length > 0;

                            return (
                                <div
                                    key={student._id}
                                    className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                                        hasMatch
                                            ? "border-indigo-200 ring-1 ring-indigo-100"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <div>
                                        {/* Match Notification Tag */}
                                        {hasMatch && (
                                            <div className="mb-3.5 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                <span>🎯</span> Teaches what you want:{" "}
                                                <span className="font-bold">{matchingSkills.join(", ")}</span>
                                            </div>
                                        )}

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

                                        {/* Can Teach */}
                                        <div className="mt-5">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                                Can Teach
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {student.skillsToTeach?.length > 0 ? (
                                                    student.skillsToTeach.map((skill, index) => {
                                                        const isWishlist = userLearnSkillsLower.includes(
                                                            skill.trim().toLowerCase()
                                                        );
                                                        return (
                                                            <span
                                                                key={index}
                                                                className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                                                                    isWishlist
                                                                        ? "bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold"
                                                                        : "bg-indigo-50/70 text-indigo-700 border-indigo-100"
                                                                }`}
                                                            >
                                                                {skill} {isWishlist && "✓"}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        No teaching skills listed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Wants to Learn */}
                                        <div className="mt-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                                Wants to Learn
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {student.skillsToLearn?.length > 0 ? (
                                                    student.skillsToLearn.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-md text-xs font-medium"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        No learning goals listed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Box */}
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
                                            disabled={!student.skillsToTeach || student.skillsToTeach.length === 0}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {(!student.skillsToTeach || student.skillsToTeach.length === 0) && (
                                                <option value="">No skills available to learn</option>
                                            )}
                                            {student.skillsToTeach?.map((skill, index) => (
                                                <option key={index} value={skill}>
                                                    {skill}{" "}
                                                    {userLearnSkillsLower.includes(skill.trim().toLowerCase())
                                                        ? "(In your wishlist)"
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => handleRequest(student._id)}
                                            disabled={
                                                requestingId === student._id ||
                                                !student.skillsToTeach ||
                                                student.skillsToTeach.length === 0
                                            }
                                            className="w-full mt-3 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                        >
                                            {requestingId === student._id
                                                ? "Sending Request..."
                                                : "Request Skill Swap"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Students;