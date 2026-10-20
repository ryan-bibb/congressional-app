const {redis} = require("./_lib/redis");

module.exports = async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const city = String(req.body?.city || "").trim();
    if (!email.includes("@") || !city) {
        return res.status(400).json({error: "Enter a valid email and city"});
    }
    try {
        await redis("HSET", "subscribers", email, city);
    } catch (error) {
        return res.status(500).json({error: "Couldn't save your sign-up"});
    }
    res.json({message: `You're signed up! Weekly alerts for ${city} will go to ${email} every Monday.`});
};
