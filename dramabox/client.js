import axios from "axios";

// Detect if running in Cloudflare Workers or Node.js
const isWorkers = typeof globalThis !== 'undefined' && 
                  globalThis.constructor && 
                  globalThis.constructor.name === 'ServiceWorkerGlobalScope';

// Import the appropriate helper based on environment
const { getHeaders } = await import(
  isWorkers ? "./dramaboxHelper-workers.js" : "./dramaboxHelper.js"
);

// Helper umum untuk request API DramaBox
export const apiRequest = async (endpoint, payload = {}, isDb2 = false, method = "post") => {
    try {
        if(isDb2){
            const url = `https://www.webfic.com${endpoint}`;
            const { data } = await axios[method](url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "pline": "DRAMABOX",
                    "language": "in",
                }
            });
            return data;
        }
        const headers = await getHeaders();
        const url = `https://sapi.dramaboxdb.com${endpoint}?timestamp=1760021610837`;
        const { data } = await axios[method](url, payload, { headers });
        return data;
    } catch (err) {
        if (err.response) {
            console.error(`❌ API Error [${endpoint}] →`, err.response.data);
        } else {
            console.error(`❌ Request Error [${endpoint}] →`, err.message);
        }
        throw err; // biar bisa ditangkap di caller
    }
};
