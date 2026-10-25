require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Request = require("./models/Request");
const Session = require("./models/Session");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Helper: Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper: Clean, trim, and deduplicate skill arrays
function cleanSkillArray(skills) {
    if (!Array.isArray(skills)) return [];
    const seen = new Set();
    const cleaned = [];

    for (const item of skills) {
        if (typeof item === "string") {
            const trimmed = item.trim();
            const lower = trimmed.toLowerCase();
            if (trimmed.length > 0 && !seen.has(lower)) {
                seen.add(lower);
                cleaned.push(trimmed);
            }
        }
    }

    return cleaned;
}

// Health check route
app.get("/", (req, res) => {
    res.json({
        message: "SkillSwap backend is running!"
    });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// User Registration
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (trimmedName.length === 0) {
            return res.status(400).json({
                message: "Name cannot be empty."
            });
        }

        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long."
            });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email: trimmedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name: trimmedName,
            email: trimmedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Account created successfully!",
            userId: user._id
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Server error during registration."
        });
    }
});

// User Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Return user info without password
        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                bio: user.bio,
                skillsToTeach: user.skillsToTeach,
                skillsToLearn: user.skillsToLearn
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error during login."
        });
    }
});

// ----------------------------------------------------
// DASHBOARD & PROFILE ROUTES
// ----------------------------------------------------

// Get Dashboard Data with Dynamic Statistics
app.get("/api/dashboard", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Calculate skill matches count
        const userLearnSkills = (user.skillsToLearn || [])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        let matchesCount = 0;
        if (userLearnSkills.length > 0) {
            const otherStudents = await User.find({ _id: { $ne: user._id } }).select("skillsToTeach");
            for (const student of otherStudents) {
                const teachSkills = (student.skillsToTeach || []).map((t) => t.trim().toLowerCase());
                const isMatch = userLearnSkills.some((skill) => teachSkills.includes(skill));
                if (isMatch) {
                    matchesCount++;
                }
            }
        }

        // Count pending requests (incoming + sent)
        const pendingRequestsCount = await Request.countDocuments({
            $or: [{ sender: user._id }, { receiver: user._id }],
            status: "pending"
        });

        // Count upcoming scheduled sessions
        const upcomingSessionsCount = await Session.countDocuments({
            $or: [{ teacher: user._id }, { learner: user._id }],
            status: "scheduled"
        });

        res.status(200).json({
            message: "Welcome to your dashboard!",
            user,
            stats: {
                skillsToTeachCount: user.skillsToTeach ? user.skillsToTeach.length : 0,
                skillsToLearnCount: user.skillsToLearn ? user.skillsToLearn.length : 0,
                matchesCount,
                pendingRequestsCount,
                upcomingSessionsCount
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            message: "Server error."
        });
    }
});

// Get User Profile
app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            message: "Server error while loading profile."
        });
    }
});

// Update User Profile
app.put("/api/profile", authMiddleware, async (req, res) => {
    try {
        const { name, bio, location, skillsToTeach, skillsToLearn } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                message: "Name is required."
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        user.name = name.trim();
        user.bio = typeof bio === "string" ? bio.trim() : "";
        user.location = typeof location === "string" ? location.trim() : "";
        user.skillsToTeach = cleanSkillArray(skillsToTeach);
        user.skillsToLearn = cleanSkillArray(skillsToLearn);

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                location: user.location,
                skillsToTeach: user.skillsToTeach,
                skillsToLearn: user.skillsToLearn
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            message: "Server error while updating profile."
        });
    }
});

// ----------------------------------------------------
// STUDENTS & SKILL MATCHING
// ----------------------------------------------------

// Get All Other Students
app.get("/api/students", authMiddleware, async (req, res) => {
    try {
        const students = await User.find({
            _id: { $ne: req.user.userId }
        })
            .select("-password")
            .sort({ name: 1 });

        res.status(200).json({
            students
        });

    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({
            message: "Server error while loading students."
        });
    }
});

// Get Matches (Compares logged-in user's skillsToLearn with others' skillsToTeach)
app.get("/api/matches", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.userId).select("skillsToLearn");

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const userSkillsToLearn = (currentUser.skillsToLearn || [])
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        if (userSkillsToLearn.length === 0) {
            return res.status(200).json({
                matches: [],
                message: "Add skills you want to learn in your profile to find matches!"
            });
        }

        const userLearnLower = userSkillsToLearn.map((s) => s.toLowerCase());

        // Find all other registered students
        const otherStudents = await User.find({
            _id: { $ne: req.user.userId }
        }).select("-password");

        const matches = [];

        for (const student of otherStudents) {
            const studentTeachSkills = student.skillsToTeach || [];
            const matchingSkills = [];

            for (const teachSkill of studentTeachSkills) {
                const trimmedTeach = teachSkill.trim();
                if (userLearnLower.includes(trimmedTeach.toLowerCase())) {
                    if (!matchingSkills.includes(trimmedTeach)) {
                        matchingSkills.push(trimmedTeach);
                    }
                }
            }

            if (matchingSkills.length > 0) {
                matches.push({
                    student: {
                        _id: student._id,
                        name: student.name,
                        email: student.email,
                        bio: student.bio,
                        location: student.location,
                        skillsToTeach: student.skillsToTeach,
                        skillsToLearn: student.skillsToLearn
                    },
                    matchingSkills
                });
            }
        }

        // Sort by highest number of matching skills
        matches.sort((a, b) => b.matchingSkills.length - a.matchingSkills.length);

        res.status(200).json({
            matches
        });

    } catch (error) {
        console.error("Get matches error:", error);
        res.status(500).json({
            message: "Server error while finding matches."
        });
    }
});

// ----------------------------------------------------
// SKILL SWAP REQUESTS
// ----------------------------------------------------

// Create Request
app.post("/api/requests", authMiddleware, async (req, res) => {
    try {
        const { receiverId, skill } = req.body;

        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                message: "A valid receiver ID is required."
            });
        }

        if (!skill || skill.trim().length === 0) {
            return res.status(400).json({
                message: "Skill is required."
            });
        }

        if (receiverId === req.user.userId) {
            return res.status(400).json({
                message: "You cannot send a request to yourself."
            });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const trimmedSkill = skill.trim();

        // Prevent duplicate pending requests for this skill between sender and receiver
        const escapedSkill = trimmedSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const existingRequest = await Request.findOne({
            sender: req.user.userId,
            receiver: receiverId,
            skill: { $regex: new RegExp(`^${escapedSkill}$`, "i") },
            status: "pending"
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "You already have a pending request for this skill with this student."
            });
        }

        const request = await Request.create({
            sender: req.user.userId,
            receiver: receiverId,
            skill: trimmedSkill
        });

        const populatedRequest = await Request.findById(request._id)
            .populate("sender", "name email location")
            .populate("receiver", "name email location");

        res.status(201).json({
            message: "Skill swap request sent successfully!",
            request: populatedRequest
        });

    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({
            message: "Server error while creating request."
        });
    }
});

// Get User's Requests (Incoming & Sent)
app.get("/api/requests", authMiddleware, async (req, res) => {
    try {
        const requests = await Request.find({
            $or: [
                { sender: req.user.userId },
                { receiver: req.user.userId }
            ]
        })
            .populate("sender", "name email location")
            .populate("receiver", "name email location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            requests
        });

    } catch (error) {
        console.error("Get requests error:", error);
        res.status(500).json({
            message: "Server error while loading requests."
        });
    }
});

// Update Request Status (Accept or Reject)
app.put("/api/requests/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid request ID."
            });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or rejected."
            });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Request not found."
            });
        }

        if (request.receiver.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only respond to requests sent to you."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: "This request has already been processed."
            });
        }

        request.status = status;
        await request.save();

        const updatedRequest = await Request.findById(request._id)
            .populate("sender", "name email location")
            .populate("receiver", "name email location");

        res.status(200).json({
            message: `Request ${status} successfully.`,
            request: updatedRequest
        });

    } catch (error) {
        console.error("Update request error:", error);
        res.status(500).json({
            message: "Server error while updating request."
        });
    }
});

// ----------------------------------------------------
// SESSIONS (LEARNING SESSIONS FROM ACCEPTED REQUESTS)
// ----------------------------------------------------

// Create Session from an Accepted Request
app.post("/api/sessions", authMiddleware, async (req, res) => {
    try {
        const { requestId, date, time, notes } = req.body;

        if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: "A valid Request ID is required."
            });
        }

        if (!date || date.trim().length === 0) {
            return res.status(400).json({
                message: "Date is required."
            });
        }

        if (!time || time.trim().length === 0) {
            return res.status(400).json({
                message: "Time is required."
            });
        }

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found."
            });
        }

        if (request.status !== "accepted") {
            return res.status(400).json({
                message: "A session can only be created for an accepted request."
            });
        }

        const currentUserId = req.user.userId;
        const isSender = request.sender.toString() === currentUserId;
        const isReceiver = request.receiver.toString() === currentUserId;

        if (!isSender && !isReceiver) {
            return res.status(403).json({
                message: "You are not authorized to create a session for this request."
            });
        }

        // In a swap request, the sender requested to learn `skill` from the receiver.
        // Therefore, receiver is the teacher and sender is the learner.
        const teacher = request.receiver;
        const learner = request.sender;

        const session = await Session.create({
            teacher,
            learner,
            requestId: request._id,
            skill: request.skill,
            date: date.trim(),
            time: time.trim(),
            notes: notes ? notes.trim() : "",
            status: "scheduled"
        });

        const populatedSession = await Session.findById(session._id)
            .populate("teacher", "name email location")
            .populate("learner", "name email location");

        res.status(201).json({
            message: "Learning session scheduled successfully!",
            session: populatedSession
        });

    } catch (error) {
        console.error("Create session error:", error);
        res.status(500).json({
            message: "Server error while creating session."
        });
    }
});

// Get User's Sessions
app.get("/api/sessions", authMiddleware, async (req, res) => {
    try {
        const sessions = await Session.find({
            $or: [
                { teacher: req.user.userId },
                { learner: req.user.userId }
            ]
        })
            .populate("teacher", "name email location")
            .populate("learner", "name email location")
            .sort({ date: 1, time: 1, createdAt: -1 });

        res.status(200).json({
            sessions
        });

    } catch (error) {
        console.error("Get sessions error:", error);
        res.status(500).json({
            message: "Server error while loading sessions."
        });
    }
});

// Update Session (Status: scheduled, completed, cancelled; or date/time/notes)
app.put("/api/sessions/:id", authMiddleware, async (req, res) => {
    try {
        const { status, date, time, notes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid session ID."
            });
        }

        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                message: "Session not found."
            });
        }

        const currentUserId = req.user.userId;
        const isParticipant =
            session.teacher.toString() === currentUserId ||
            session.learner.toString() === currentUserId;

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not authorized to update this session."
            });
        }

        if (status) {
            if (!["scheduled", "completed", "cancelled"].includes(status)) {
                return res.status(400).json({
                    message: "Status must be scheduled, completed, or cancelled."
                });
            }
            session.status = status;
        }

        if (date && date.trim().length > 0) {
            session.date = date.trim();
        }

        if (time && time.trim().length > 0) {
            session.time = time.trim();
        }

        if (notes !== undefined) {
            session.notes = notes.trim();
        }

        await session.save();

        const updatedSession = await Session.findById(session._id)
            .populate("teacher", "name email location")
            .populate("learner", "name email location");

        res.status(200).json({
            message: "Session updated successfully.",
            session: updatedSession
        });

    } catch (error) {
        console.error("Update session error:", error);
        res.status(500).json({
            message: "Server error while updating session."
        });
    }
});

// ----------------------------------------------------
// DATABASE CONNECTION & SERVER START
// ----------------------------------------------------

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});