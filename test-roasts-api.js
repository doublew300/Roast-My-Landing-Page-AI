import fetch from 'node-fetch';

async function testRoastsApi() {
    console.log("Testing /api/roasts...");
    try {
        const res = await fetch('http://localhost:3000/api/roasts?sort=newest&limit=50');
        console.log("Status:", res.status);

        if (res.ok) {
            const data = await res.json();
            console.log("Data length:", Array.isArray(data) ? data.length : "Not an array");
            if (Array.isArray(data) && data.length > 0) {
                console.log("First item:", data[0]);
            } else {
                console.log("Full response:", data);
            }
        } else {
            const text = await res.text();
            console.log("Error body:", text);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testRoastsApi();
