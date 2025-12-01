import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/roasts');
        const data = await res.json();
        console.log("Count:", data.data?.length);
        if (data.data?.length > 0) {
            console.log("First item:", data.data[0]);
        }
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
