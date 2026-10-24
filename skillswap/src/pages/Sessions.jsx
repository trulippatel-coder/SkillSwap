import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Sessions() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedRequestId = searchParams.get("requestId");

    const [sessions, setSessions] = useState([]);
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Active status tab: "upcoming", "completed", "cancelled", "all"
    const [activeTab, setActiveTab] = useState("upcoming");

    // Modal state for creating a session
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        requestId: preselectedRequestId || "",
        date: "",
        time: "",
        notes: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (preselectedRequestId) {
            setModalData((prev) => ({ ...prev, requestId: preselectedRequestId }));
            setIsModalOpen(true);
        }
    }, [preselectedRequestId]);

    async function loadData() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            // Load sessions and requests in parallel
            const [sessionsRes, requestsRes] = await Promise.all([
                fetch("http://localhost:5001/api/sessions", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch("http://localhost:5001/api/requests", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const sessionsData = await sessionsRes.json();
            const requestsData = await requestsRes.json();

            if (!sessionsRes.ok) {
                setError(sessionsData.message || "Could not load learning sessions.");
                setLoading(false);
                return;
            }

            setSessions(sessionsData.sessions || []);

            if (requestsRes.ok && requestsData.requests) {
                const accepted = requestsData.requests.filter(
                    (req) => req.status === "accepted"
                );
                setAcceptedRequests(accepted);

                if (!modalData.requestId && accepted.length > 0) {
                    setModalData((prev) => ({ ...prev, requestId: accepted[0]._id }));
                }
            }

            setLoading(false);
        } catch (err) {
            setError("Could not connect to the server.");
            setLoading(false);
        }
    }

    async function handleCreateSession(e) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        setModalError("");

        if (!modalData.requestId) {
            setModalError("Please select an accepted skill swap request.");
            return;
        }

        if (!modalData.date || !modalData.time) {
            setModalError("Both date and time are required.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch("http://localhost:5001/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(modalData)
            });

            const data = await response.json();

            if (!response.ok) {
                setModalError(data.message || "Failed to schedule session.");
                setSubmitting(false);
                return;
            }

            setMessage("Learning session scheduled successfully! 🎉");
            setSessions((prev) => [data.session, ...prev]);
            setIsModalOpen(false);
            setSubmitting(false);
            setModalData({
                requestId: acceptedRequests[0]?._id || "",
                date: "",
                time: "",
                notes: ""
            });
            setActiveTab("upcoming");
        } catch (err) {
            setModalError("Could not connect to the server.");
            setSubmitting(false);
        }
    }

    async function handleUpdateStatus(sessionId, newStatus) {
        const token = localStorage.getItem("token");

        setUpdatingId(sessionId);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:5001/api/sessions/${sessionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not update session.");
                setUpdatingId(null);
                return;
            }

            setMessage(
                newStatus === "completed"
                    ? "Great job! Session marked as completed."
                    : "Session cancelled."
            );

            setSessions((prev) =>
                prev.map((s) => (s._id === sessionId ? data.session : s))
            );
            setUpdatingId(null);
        } catch (err) {
            setError("Could not connect to the server.");
            setUpdatingId(null);
        }
    }

    const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
    const completedSessions = sessions.filter((s) => s.status === "completed");
    const cancelledSessions = sessions.filter((s) => s.status === "cancelled");

    const displayedSessions =
        activeTab === "upcoming"
            ? upcomingSessions
            : activeTab === "completed"
            ? completedSessions
            : activeTab === "cancelled"
            ? cancelledSessions
            : sessions;

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading learning sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Learning Sessions 📅
                        </h1>
                        <p className="text-gray-600 mt-1.5">
                            Plan and track one-on-one skill exchange appointments with your peers.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setModalError("");
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition flex items-center justify-center gap-2"
                    >
                        <span>➕</span> Schedule Session
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                        ✅ {message}
                    </div>
                )}

                {/* Status Tabs */}
                <div className="flex border-b border-gray-200 mb-8 gap-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`pb-3 font-semibold text-sm transition whitespace-nowrap relative ${
                            activeTab === "upcoming"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Upcoming ({upcomingSessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`pb-3 font-semibold text-sm transition whitespace-nowrap relative ${
                            activeTab === "completed"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Completed ({completedSessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("cancelled")}
                        className={`pb-3 font-semibold text-sm transition whitespace-nowrap relative ${
                            activeTab === "cancelled"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Cancelled ({cancelledSessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`pb-3 font-semibold text-sm transition whitespace-nowrap relative ${
                            activeTab === "all"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        All ({sessions.length})
                    </button>
                </div>

                {/* Empty State */}
                {displayedSessions.length === 0 && !error && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                            📅
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            No {activeTab} sessions
                        </h2>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            {activeTab === "upcoming"
                                ? "You don't have any upcoming sessions scheduled. Once you accept a skill swap request, you can schedule a session!"
                                : `No sessions currently marked as ${activeTab}.`}
                        </p>
                        {acceptedRequests.length > 0 ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                            >
                                Schedule a Session Now
                            </button>
                        ) : (
                            <Link
                                to="/requests"
                                className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                            >
                                View Accepted Requests
                            </Link>
                        )}
                    </div>
                )}

                {/* Sessions Grid */}
                {displayedSessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedSessions.map((session) => {
                            const isTeacher = session.teacher?._id === loggedInUser?.id;
                            const isLearner = session.learner?._id === loggedInUser?.id;
                            const otherPerson = isTeacher ? session.learner : session.teacher;

                            return (
                                <div
                                    key={session._id}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Card Header: Skill & Status Badge */}
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                Skill: {session.skill}
                                            </span>

                                            {session.status === "scheduled" && (
                                                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <span>⏳</span> Scheduled
                                                </span>
                                            )}
                                            {session.status === "completed" && (
                                                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <span>✓</span> Completed
                                                </span>
                                            )}
                                            {session.status === "cancelled" && (
                                                <span className="bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <span>✕</span> Cancelled
                                                </span>
                                            )}
                                        </div>

                                        {/* Date and Time */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 flex items-center justify-around text-center text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
                                                <p className="font-bold text-gray-900 mt-0.5">
                                                    📅 {session.date}
                                                </p>
                                            </div>
                                            <div className="border-r border-gray-200 h-8"></div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase">Time</p>
                                                <p className="font-bold text-gray-900 mt-0.5">
                                                    ⏰ {session.time}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Participants */}
                                        <div className="space-y-2.5 text-sm mb-4">
                                            <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Instructor (Teacher):</span>
                                                <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                    {session.teacher?.name || "Student"}
                                                    {isTeacher && (
                                                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            (You)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Student (Learner):</span>
                                                <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                    {session.learner?.name || "Student"}
                                                    {isLearner && (
                                                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            (You)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {session.notes && (
                                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 mb-4">
                                                <p className="font-bold uppercase tracking-wider text-amber-800 text-[10px] mb-1">
                                                    Session Notes
                                                </p>
                                                <p className="leading-relaxed">{session.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons for Scheduled Session */}
                                    {session.status === "scheduled" && (
                                        <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(session._id, "completed")}
                                                disabled={updatingId === session._id}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-xs"
                                            >
                                                {updatingId === session._id ? "Updating..." : "✓ Mark Completed"}
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(session._id, "cancelled")}
                                                disabled={updatingId === session._id}
                                                className="bg-white border border-red-200 text-red-600 py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-50 transition disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* CREATE / SCHEDULE SESSION MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                Schedule Learning Session 📅
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {modalError && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                                ⚠️ {modalError}
                            </div>
                        )}

                        <form onSubmit={handleCreateSession} className="mt-4 space-y-4">
                            {/* Request selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Accepted Skill Swap Request *
                                </label>
                                {acceptedRequests.length === 0 ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                        No accepted requests found yet. You must first have an accepted request before scheduling a session.
                                    </div>
                                ) : (
                                    <select
                                        value={modalData.requestId}
                                        onChange={(e) =>
                                            setModalData({ ...modalData, requestId: e.target.value })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select an accepted request</option>
                                        {acceptedRequests.map((req) => (
                                            <option key={req._id} value={req._id}>
                                                Skill: {req.skill} | With:{" "}
                                                {req.sender?._id === loggedInUser?.id
                                                    ? `${req.receiver?.name} (Teacher)`
                                                    : `${req.sender?.name} (Learner)`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={modalData.date}
                                        onChange={(e) =>
                                            setModalData({ ...modalData, date: e.target.value })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={modalData.time}
                                        onChange={(e) =>
                                            setModalData({ ...modalData, time: e.target.value })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Notes / Location / Meeting Link (Optional)
                                </label>
                                <textarea
                                    value={modalData.notes}
                                    onChange={(e) =>
                                        setModalData({ ...modalData, notes: e.target.value })
                                    }
                                    rows="3"
                                    placeholder="e.g. Google Meet link, library floor 2, bring laptop..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || acceptedRequests.length === 0}
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {submitting ? "Scheduling..." : "Schedule Session"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sessions;
