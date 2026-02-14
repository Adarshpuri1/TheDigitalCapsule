import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const FILE = "./capsules.json";


const readCap = () => {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE));
};


const writeCap = (data) => {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

const generateId = (capsules) => {
    if (capsules.length === 0) return 1;
    return capsules[capsules.length - 1].id + 1;
};



app.post("/api/capsule", (req, res) => {
    const { message, unlockTime } = req.body;

    if (!message || !unlockTime) {
        return res.status(400).json({
            success: false,
            message: "Message and unlockTime are required",
        });
    }

    const capsules = readCap();

    const newCapsule = {
        id: generateId(capsules),
        message,
        unlockTime,
        createdAt: new Date(),
    };

    capsules.push(newCapsule);
    writeCap(capsules);

    res.status(200).json({
        success: true,
        message: "Capsule created sucessfully",
        capsuleId: newCapsule.id,
    });
});



app.get("/api/capsule/:id", (req, res) => {
    const capsules = readCap();
    const id = parseInt(req.params.id);

    const capsule = capsules.find(c => c.id === id);

    if (!capsule) {
        return res.status(404).json({
            success: false,
            message: "Cpsule not found",
        });
    }

    const now = new Date();
    const unlockTime = new Date(capsule.unlockTime);

    if (now < unlockTime) {
        return res.status(403).json({
            success: false,
            message: "Cpsule is locked",
            unlockTime: capsule.unlockTime,
        });
    }

    res.json({
        success: true,
        message: "Cpsule unlocked",
        data: capsule.message,
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
  