const {redis} = require("./_lib/redis");

module.exports = async (req, res) => {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({error: "Unauthorized"});
    }
    const {EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY} = process.env;

    const subscribers = await redis("HGETALL", "subscribers");
    let sent = 0;
    for (let i = 0; i < subscribers.length; i += 2) {
        const email = subscribers[i];
        const city = subscribers[i + 1];

        const summaryResponse = await fetch(`https://${req.headers.host}/api/summary?city=${encodeURIComponent(city)}`);
        if (!summaryResponse.ok) {
            continue;
        }
        const data = await summaryResponse.json();

        const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY,
                template_params: {to_email: email, city: data.city, summary: data.summary},
            }),
        });
        if (emailResponse.ok) {
            sent++;
        }
        await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    res.json({sent, total: subscribers.length / 2});
};
