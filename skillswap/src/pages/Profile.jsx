import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";

function Profile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        location: "",
        skillsToTeach: "",
        skillsToLearn: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load profile
    useEffect(() => {
        async function loadProfile() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/api/profile", {
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

                const user = data.user;

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    bio: user.bio || "",
                    location: user.location || "",
                    skillsToTeach: user.skillsToTeach
                        ? user.skillsToTeach.join(", ")
                        : "",
                    skillsToLearn: user.skillsToLearn
                        ? user.skillsToLearn.join(", ")
                        : ""
                });

                setLoading(false);
            } catch (err) {
                setError("Could not connect to the server.");
                setLoading(false);
            }
        }

        loadProfile();
    }, [navigate]);

    // Handle input changes
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    // Save profile
    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Full Name is required.");
            return;
        }

        setSaving(true);
        const token = localStorage.getItem("token");

        // Split by comma, trim, filter out empty, and remove duplicates case-insensitively
        function cleanList(str) {
            const items = str.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
            const seen = new Set();
            const result = [];
            for (const item of items) {
                const lower = item.toLowerCase();
                if (!seen.has(lower)) {
                    seen.add(lower);
                    result.push(item);
                }
            }
            return result;
        }

        const skillsToTeach = cleanList(formData.skillsToTeach);
        const skillsToLearn = cleanList(formData.skillsToLearn);

        try {
            const response = await fetch("http://localhost:5001/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    bio: formData.bio.trim(),
                    location: formData.location.trim(),
                    skillsToTeach,
                    skillsToLearn
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not update profile.");
                setSaving(false);
                return;
            }

            setSuccess("Profile updated successfully! 🎉");

            // Update stored user information
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    location: data.user.location,
                    bio: data.user.bio,
                    skillsToTeach: data.user.skillsToTeach,
                    skillsToLearn: data.user.skillsToLearn
                })
            );

            // Normalize input display with cleaned array strings
            setFormData((prev) => ({
                ...prev,
                skillsToTeach: data.user.skillsToTeach.join(", "),
                skillsToLearn: data.user.skillsToLearn.join(", ")
            }));

        } catch (err) {
            setError("Could not connect to the server.");
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Your Profile 👤
                        </h1>
                        <p className="text-gray-600 mt-1.5">
                            Manage your personal info and the skills you can teach or want to learn.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/matches"
                            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition flex items-center gap-1.5"
                        >
                            <span>🎯</span> Check Matches
                        </Link>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                        ✅ {success}
                    </div>
                )}

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm"
                >
                    {/* Full Name */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Your full name"
                        />
                    </div>

                    {/* Email (Read only) */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Campus Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            Email cannot be changed after registration.
                        </p>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Location / Campus / City
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. North Campus, Ahmedabad"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Bio & Academic Interests
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell other students about your background, projects, or what you enjoy learning..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* Skills You Teach */}
                    <div className="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                            Skills You Can Teach
                        </label>
                        <p className="text-xs text-indigo-700 mb-3">
                            Separate skills with commas (e.g. JavaScript, React, Graphic Design, Python).
                        </p>
                        <input
                            type="text"
                            name="skillsToTeach"
                            value={formData.skillsToTeach}
                            onChange={handleChange}
                            placeholder="e.g. React, Node.js, Public Speaking"
                            className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Skills You Want to Learn */}
                    <div className="mb-8 p-5 bg-purple-50/50 border border-purple-100 rounded-xl">
                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1">
                            Skills You Want to Learn
                        </label>
                        <p className="text-xs text-purple-700 mb-3">
                            These skills will be matched against what other students can teach. Separate with commas.
                        </p>
                        <input
                            type="text"
                            name="skillsToLearn"
                            value={formData.skillsToLearn}
                            onChange={handleChange}
                            placeholder="e.g. Python, Machine Learning, UI/UX, Docker"
                            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {saving ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default Profile;