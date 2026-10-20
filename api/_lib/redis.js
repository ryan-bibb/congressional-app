async function redis(...command) {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const response = await fetch(url, {
        method: "POST",
        headers: {"Authorization": `Bearer ${token}`},
        body: JSON.stringify(command),
    });
    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error || "Redis request failed");
    }
    return data.result;
}

module.exports = {redis};
