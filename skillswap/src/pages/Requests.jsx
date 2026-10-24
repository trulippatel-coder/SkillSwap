import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Requests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // Filter tab: "all", "incoming", "sent"
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/requests", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not load requests.");
                setLoading(false);
                return;
            }

            setRequests(data.requests || []);
            setLoading(false);
        } catch (err) {
            setError("Could not connect to the server.");
            setLoading(false);
        }
    }

    async function updateRequest(requestId, status) {
        const token = localStorage.getItem("token");

        setUpdatingId(requestId);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:5001/api/requests/${requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not update request.");
                setUpdatingId(null);
                return;
            }

            setMessage(
                status === "accepted"
                    ? "Skill swap accepted! You can now schedule a learning session."
                    : "Request rejected."
            );

            // Update in place
            setRequests((currentRequests) =>
                currentRequests.map((req) =>
                    req._id === requestId
                        ? { ...req, status }
                        : req
                )
            );

            setUpdatingId(null);
        } catch (err) {
            setError("Could not connect to the server.");
            setUpdatingId(null);
        }
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const incomingRequests = requests.filter(
        (request) => request.receiver?._id === user?.id
    );

    const sentRequests = requests.filter(
        (request) => request.sender?._id === user?.id
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading skill swap requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Skill Swap Requests 📨
                        </h1>
                        <p className="text-gray-600 mt-1.5">
                            Manage invitations to teach or learn skills with other students.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/sessions"
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition flex items-center gap-1.5"
                        >
                            <span>📅</span> View Sessions
                        </Link>
                    </div>
                </div>

                {/* Feedback Alerts */}
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

                {/* Filter Tabs */}
                <div className="flex border-b border-gray-200 mb-8 gap-4">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`pb-3 font-semibold text-sm transition relative ${
                            activeTab === "all"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        All Requests ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("incoming")}
                        className={`pb-3 font-semibold text-sm transition relative ${
                            activeTab === "incoming"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Incoming ({incomingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`pb-3 font-semibold text-sm transition relative ${
                            activeTab === "sent"
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {/* INCOMING REQUESTS SECTION */}
                {(activeTab === "all" || activeTab === "incoming") && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span>📥</span> Incoming Requests
                                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    {incomingRequests.length}
                                </span>
                            </h2>
                        </div>

                        {incomingRequests.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs">
                                <p className="text-gray-500 text-sm">
                                    No incoming requests at the moment. When others want to learn from you, their requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {incomingRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {request.sender?.name || "Student"}
                                                    </h3>
                                                    {request.sender?.location && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            📍 {request.sender.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {request.sender?.email}
                                                </p>

                                                <p className="text-gray-700 text-sm mt-3">
                                                    Wants to learn:{" "}
                                                    <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                                                        {request.skill}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                {request.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateRequest(request._id, "accepted")
                                                            }
                                                            disabled={updatingId === request._id}
                                                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50 shadow-xs"
                                                        >
                                                            {updatingId === request._id
                                                                ? "Processing..."
                                                                : "Accept"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateRequest(request._id, "rejected")
                                                            }
                                                            disabled={updatingId === request._id}
                                                            className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {request.status === "accepted" && (
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <span className="bg-green-50 text-green-700 border border-green-200 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span>✓</span> Accepted
                                                        </span>
                                                        <Link
                                                            to={`/sessions?requestId=${request._id}`}
                                                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
                                                        >
                                                            📅 Schedule Session
                                                        </Link>
                                                    </div>
                                                )}

                                                {request.status === "rejected" && (
                                                    <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                        <span>✕</span> Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* SENT REQUESTS SECTION */}
                {(activeTab === "all" || activeTab === "sent") && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span>📤</span> Sent Requests
                                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    {sentRequests.length}
                                </span>
                            </h2>
                        </div>

                        {sentRequests.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs">
                                <p className="text-gray-500 text-sm mb-3">
                                    You haven't sent any skill swap requests yet.
                                </p>
                                <Link
                                    to="/students"
                                    className="inline-block text-indigo-600 text-sm font-semibold hover:underline"
                                >
                                    Browse Students to request a swap →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sentRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {request.receiver?.name || "Student"}
                                                    </h3>
                                                    {request.receiver?.location && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            📍 {request.receiver.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {request.receiver?.email}
                                                </p>

                                                <p className="text-gray-700 text-sm mt-3">
                                                    Requested to learn:{" "}
                                                    <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                                                        {request.skill}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {request.status === "pending" && (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                        <span>⏳</span> Pending Response
                                                    </span>
                                                )}

                                                {request.status === "accepted" && (
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <span className="bg-green-50 text-green-700 border border-green-200 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <span>✓</span> Accepted
                                                        </span>
                                                        <Link
                                                            to={`/sessions?requestId=${request._id}`}
                                                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
                                                        >
                                                            📅 Schedule Session
                                                        </Link>
                                                    </div>
                                                )}

                                                {request.status === "rejected" && (
                                                    <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                        <span>✕</span> Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Requests;