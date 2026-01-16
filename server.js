import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    getChapters,
    getDramaDetail,
    getDetailsv2,
    batchDownload,
    getDramaList,
    getCategories,
    getBookFromCategories,
    getRecommendedBooks,
    searchDrama,
    searchDramaIndex
} from './dramabox/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ==================== MODIFIED PRETTY PRINT MIDDLEWARE ====================
app.use((req, res, next) => {
    // Skip middleware untuk root endpoint (karena kita pakai HTML)
    if (req.path === '/' || req.path === '') {
        return next();
    }
    
    const originalJson = res.json;
    res.json = function(data) {
        const isPretty = req.query.pretty === 'true' || 
                        req.query.format === 'pretty' || 
                        req.query.p === '1';
        
        if (isPretty) {
            const indent = parseInt(req.query.indent) || 2;
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.stringify(data, null, indent));
        }
        return originalJson.call(this, data);
    };
    next();
});

// ==================== API DOCUMENTATION ENDPOINT ====================

// Root endpoint - API Documentation Interactive
app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DramaBox API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #4cc9f0;
            margin-bottom: 30px;
        }
        
        h1 {
            font-size: 2.8rem;
            background: linear-gradient(90deg, #4cc9f0, #f72585);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #b8b8b8;
            font-size: 1.2rem;
        }
        
        .info-box {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid rgba(76, 201, 240, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .endpoint-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .endpoint-card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        
        .endpoint-card:hover {
            transform: translateY(-5px);
            border-color: #4cc9f0;
            box-shadow: 0 10px 30px rgba(76, 201, 240, 0.2);
        }
        
        .method {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        .method.get { background: #10b981; }
        .method.post { background: #f59e0b; }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 15px;
            border-radius: 8px;
            margin: 10px 0;
            word-break: break-all;
            border-left: 4px solid #4cc9f0;
        }
        
        .param {
            margin: 8px 0;
            padding-left: 15px;
            border-left: 2px solid #f72585;
        }
        
        .param-name {
            color: #4cc9f0;
            font-weight: bold;
        }
        
        .test-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .test-btn {
            background: linear-gradient(90deg, #f72585, #b5179e);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        .test-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(247, 37, 133, 0.4);
        }
        
        .test-btn.secondary {
            background: linear-gradient(90deg, #4361ee, #3a0ca3);
        }
        
        .test-btn.success {
            background: linear-gradient(90deg, #10b981, #047857);
        }
        
        input, textarea {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
        }
        
        input:focus, textarea:focus {
            outline: none;
            border-color: #4cc9f0;
        }
        
        .response-box {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-online {
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }
        
        .endpoint-group {
            margin-bottom: 40px;
        }
        
        .group-title {
            font-size: 1.5rem;
            color: #4cc9f0;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(76, 201, 240, 0.3);
        }
        
        .loading {
            display: none;
            text-align: center;
            margin: 10px 0;
            color: #4cc9f0;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .notification.success {
            background: #10b981;
            opacity: 1;
        }
        
        .notification.error {
            background: #ef4444;
            opacity: 1;
        }
        
        .copy-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        
        @media (max-width: 768px) {
            .endpoint-container {
                grid-template-columns: 1fr;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎭 DramaBox API Documentation</h1>
            <p class="subtitle">Interactive API Testing Dashboard</p>
            <div style="margin-top: 15px;">
                <span class="status-indicator status-online"></span>
                <span>Server Status: Online</span>
                <span style="margin-left: 20px;">Port: ${PORT}</span>
                <span style="margin-left: 20px;">Version: 1.0.0</span>
            </div>
        </header>
        
        <div class="info-box">
            <h3>📚 API Overview</h3>
            <p>This documentation provides interactive testing for all DramaBox API endpoints. Click the "Test" buttons to execute requests directly from this page.</p>
            <p><strong>Base URL:</strong> <code>http://${req.headers.host}</code></p>
            <p><strong>Default JSON Formatting:</strong> Add <code>?pretty=true</code> to any endpoint for formatted JSON</p>
        </div>
        
        <div class="endpoint-group">
            <h2 class="group-title">🎬 Drama Endpoints</h2>
            <div class="endpoint-container">
                
                <!-- Drama List -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/drama/list</div>
                    <p>Get paginated list of dramas</p>
                    <div class="param">
                        <span class="param-name">pageNo</span> (optional) - Page number, default: 1
                    </div>
                    <div class="param">
                        <span class="param-name">log</span> (optional) - Enable logging, default: false
                    </div>
                    <div class="test-section">
                        <input type="number" id="dramaListPage" placeholder="Page No (default: 1)" value="1">
                        <select id="dramaListLog">
                            <option value="false">Log: Off</option>
                            <option value="true">Log: On</option>
                        </select>
                        <button class="test-btn" onclick="testEndpoint('dramaList')">Test Endpoint</button>
                        <button class="test-btn secondary" onclick="testWithPretty('dramaList')">Test with Pretty Print</button>
                    </div>
                    <div class="response-box" id="response-dramaList"></div>
                </div>
                
                <!-- Drama Detail -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/drama/:bookId</div>
                    <p>Get details of a specific drama</p>
                    <div class="param">
                        <span class="param-name">bookId</span> (required) - Drama ID
                    </div>
                    <div class="param">
                        <span class="param-name">needRecommend</span> (optional) - Include recommendations
                    </div>
                    <div class="test-section">
                        <input type="text" id="dramaDetailId" placeholder="Enter Book ID" value="1">
                        <select id="dramaDetailRecommend">
                            <option value="false">No Recommendations</option>
                            <option value="true">With Recommendations</option>
                        </select>
                        <button class="test-btn" onclick="testEndpoint('dramaDetail')">Test Endpoint</button>
                    </div>
                    <div class="response-box" id="response-dramaDetail"></div>
                </div>
                
                <!-- Drama Categories -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/drama/categories</div>
                    <p>Get list of drama categories</p>
                    <div class="param">
                        <span class="param-name">pageNo</span> (optional) - Page number
                    </div>
                    <div class="test-section">
                        <input type="number" id="categoriesPage" placeholder="Page No" value="1">
                        <button class="test-btn" onclick="testEndpoint('categories')">Test Endpoint</button>
                    </div>
                    <div class="response-box" id="response-categories"></div>
                </div>
                
                <!-- Recommended Books -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/drama/recommended</div>
                    <p>Get recommended dramas</p>
                    <div class="param">
                        <span class="param-name">log</span> (optional) - Enable logging
                    </div>
                    <div class="test-section">
                        <select id="recommendedLog">
                            <option value="false">Log: Off</option>
                            <option value="true">Log: On</option>
                        </select>
                        <button class="test-btn success" onclick="testEndpoint('recommended')">Get Recommendations</button>
                    </div>
                    <div class="response-box" id="response-recommended"></div>
                </div>
                
            </div>
        </div>
        
        <div class="endpoint-group">
            <h2 class="group-title">📖 Chapter Endpoints</h2>
            <div class="endpoint-container">
                
                <!-- Chapter List -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/chapter/:bookId</div>
                    <p>Get chapters of a drama</p>
                    <div class="param">
                        <span class="param-name">bookId</span> (required) - Drama ID
                    </div>
                    <div class="param">
                        <span class="param-name">log</span> (optional) - Enable logging
                    </div>
                    <div class="test-section">
                        <input type="text" id="chapterListId" placeholder="Book ID" value="1">
                        <button class="test-btn" onclick="testEndpoint('chapterList')">Get Chapters</button>
                    </div>
                    <div class="response-box" id="response-chapterList"></div>
                </div>
                
                <!-- Batch Download -->
                <div class="endpoint-card">
                    <span class="method post">POST</span>
                    <div class="endpoint-path">/api/chapter/batch-download</div>
                    <p>Batch download multiple chapters</p>
                    <div class="param">
                        <span class="param-name">bookId</span> (required) - Drama ID
                    </div>
                    <div class="param">
                        <span class="param-name">chapterIdList</span> (required) - Array of chapter IDs
                    </div>
                    <div class="test-section">
                        <input type="text" id="batchBookId" placeholder="Book ID" value="1">
                        <textarea id="batchChapterIds" placeholder="Chapter IDs as JSON array
Example: [1, 2, 3, 4, 5]" rows="3">[1, 2, 3]</textarea>
                        <button class="test-btn" onclick="testEndpoint('batchDownload')">Execute Batch Download</button>
                    </div>
                    <div class="response-box" id="response-batchDownload"></div>
                </div>
                
            </div>
        </div>
        
        <div class="endpoint-group">
            <h2 class="group-title">🔍 Search Endpoints</h2>
            <div class="endpoint-container">
                
                <!-- Search Drama -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/search</div>
                    <p>Search dramas by keyword</p>
                    <div class="param">
                        <span class="param-name">keyword</span> (required) - Search term
                    </div>
                    <div class="param">
                        <span class="param-name">log</span> (optional) - Enable logging
                    </div>
                    <div class="test-section">
                        <input type="text" id="searchKeyword" placeholder="Enter keyword" value="love">
                        <button class="test-btn" onclick="testEndpoint('search')">Search</button>
                    </div>
                    <div class="response-box" id="response-search"></div>
                </div>
                
                <!-- Hot Search List -->
                <div class="endpoint-card">
                    <span class="method get">GET</span>
                    <div class="endpoint-path">/api/search/hot</div>
                    <p>Get trending search terms</p>
                    <div class="param">
                        <span class="param-name">log</span> (optional) - Enable logging
                    </div>
                    <div class="test-section">
                        <button class="test-btn" onclick="testEndpoint('hotSearch')">Get Hot Searches</button>
                    </div>
                    <div class="response-box" id="response-hotSearch"></div>
                </div>
                
            </div>
        </div>
        
        <!-- Quick Test Section -->
        <div class="info-box">
            <h3>⚡ Quick API Test</h3>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <input type="text" id="quickEndpoint" placeholder="Enter endpoint (e.g., /api/drama/list)" style="flex: 1;">
                <button class="test-btn" onclick="quickTest()">Quick Test</button>
                <button class="test-btn secondary" onclick="quickTest(true)">With Pretty Print</button>
            </div>
            <div class="response-box" id="response-quick" style="margin-top: 15px;"></div>
        </div>
        
        <!-- Server Info -->
        <div class="info-box">
            <h3>🖥️ Server Information</h3>
            <p><strong>Port:</strong> ${PORT}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Uptime:</strong> <span id="uptime">Just started</span></p>
            <p><strong>Memory Usage:</strong> <span id="memoryUsage">Calculating...</span></p>
            <button class="test-btn" onclick="getServerStats()">Refresh Stats</button>
        </div>
    </div>
    
    <!-- Notification -->
    <div class="notification" id="notification"></div>
    
    <script>
        const baseUrl = window.location.origin;
        let serverStartTime = new Date();
        
        // Format JSON untuk display
        function formatJson(data) {
            try {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                return JSON.stringify(data, null, 2);
            } catch {
                return data;
            }
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            const notif = document.getElementById('notification');
            notif.textContent = message;
            notif.className = 'notification ' + type;
            setTimeout(() => {
                notif.style.opacity = '0';
            }, 3000);
        }
        
        // Update uptime
        function updateUptime() {
            const now = new Date();
            const diff = now - serverStartTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            document.getElementById('uptime').textContent = 
                \`\${hours}h \${minutes}m \${seconds}s\`;
        }
        
        // Test endpoint functions
        async function testEndpoint(endpointType) {
            const responseBox = document.getElementById(\`response-\${endpointType}\`);
            responseBox.innerHTML = '<div class="loading">⏳ Testing endpoint...</div>';
            
            let url = '';
            let options = { method: 'GET' };
            
            try {
                switch(endpointType) {
                    case 'dramaList':
                        const page = document.getElementById('dramaListPage').value || 1;
                        const log = document.getElementById('dramaListLog').value;
                        url = \`\${baseUrl}/api/drama/list?pageNo=\${page}&log=\${log}\`;
                        break;
                        
                    case 'dramaDetail':
                        const bookId = document.getElementById('dramaDetailId').value;
                        const needRecommend = document.getElementById('dramaDetailRecommend').value;
                        if (!bookId) {
                            showNotification('Book ID is required!', 'error');
                            return;
                        }
                        url = \`\${baseUrl}/api/drama/\${bookId}?needRecommend=\${needRecommend}\`;
                        break;
                        
                    case 'categories':
                        const catPage = document.getElementById('categoriesPage').value || 1;
                        url = \`\${baseUrl}/api/drama/categories?pageNo=\${catPage}\`;
                        break;
                        
                    case 'recommended':
                        const recLog = document.getElementById('recommendedLog').value;
                        url = \`\${baseUrl}/api/drama/recommended?log=\${recLog}\`;
                        break;
                        
                    case 'chapterList':
                        const chapterBookId = document.getElementById('chapterListId').value;
                        if (!chapterBookId) {
                            showNotification('Book ID is required!', 'error');
                            return;
                        }
                        url = \`\${baseUrl}/api/chapter/\${chapterBookId}\`;
                        break;
                        
                    case 'batchDownload':
                        const batchBookId = document.getElementById('batchBookId').value;
                        const chapterIds = document.getElementById('batchChapterIds').value;
                        
                        if (!batchBookId || !chapterIds) {
                            showNotification('Book ID and Chapter IDs are required!', 'error');
                            return;
                        }
                        
                        url = \`\${baseUrl}/api/chapter/batch-download\`;
                        options = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                bookId: batchBookId,
                                chapterIdList: JSON.parse(chapterIds)
                            })
                        };
                        break;
                        
                    case 'search':
                        const keyword = document.getElementById('searchKeyword').value;
                        if (!keyword) {
                            showNotification('Keyword is required!', 'error');
                            return;
                        }
                        url = \`\${baseUrl}/api/search?keyword=\${encodeURIComponent(keyword)}\`;
                        break;
                        
                    case 'hotSearch':
                        url = \`\${baseUrl}/api/search/hot\`;
                        break;
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                responseBox.innerHTML = \`
                    <div style="color: \${response.ok ? '#10b981' : '#ef4444'}; margin-bottom: 10px;">
                        Status: \${response.status} \${response.statusText}
                    </div>
                    <pre>\${formatJson(data)}</pre>
                    <button class="copy-btn" onclick="copyToClipboard('\${JSON.stringify(data, null, 2)}')">
                        Copy Response
                    </button>
                \`;
                
                showNotification(\`\${endpointType} test successful!\`);
                
            } catch (error) {
                responseBox.innerHTML = \`
                    <div style="color: #ef4444; margin-bottom: 10px;">
                        Error: \${error.message}
                    </div>
                    <pre>\${error.stack}</pre>
                \`;
                showNotification(\`Test failed: \${error.message}\`, 'error');
            }
        }
        
        // Test with pretty print
        function testWithPretty(endpointType) {
            // Add pretty parameter to existing logic
            const pageInput = document.getElementById('dramaListPage');
            const logSelect = document.getElementById('dramaListLog');
            
            if (pageInput && logSelect) {
                const page = pageInput.value || 1;
                const log = logSelect.value;
                const url = \`\${baseUrl}/api/drama/list?pageNo=\${page}&log=\${log}&pretty=true\`;
                
                fetch(url)
                    .then(r => r.json())
                    .then(data => {
                        const responseBox = document.getElementById(\`response-\${endpointType}\`);
                        responseBox.innerHTML = \`<pre>\${formatJson(data)}</pre>\`;
                        showNotification('Test with pretty print successful!');
                    })
                    .catch(error => {
                        showNotification(\`Test failed: \${error.message}\`, 'error');
                    });
            }
        }
        
        // Quick test function
        async function quickTest(withPretty = false) {
            const endpoint = document.getElementById('quickEndpoint').value;
            if (!endpoint) {
                showNotification('Please enter an endpoint', 'error');
                return;
            }
            
            const responseBox = document.getElementById('response-quick');
            responseBox.innerHTML = '<div class="loading">Testing...</div>';
            
            try {
                const url = withPretty ? \`\${baseUrl}\${endpoint}?pretty=true\` : \`\${baseUrl}\${endpoint}\`;
                const response = await fetch(url);
                const data = await response.json();
                
                responseBox.innerHTML = \`
                    <div style="color: \${response.ok ? '#10b981' : '#ef4444'};">
                        URL: \${url}<br>
                        Status: \${response.status} \${response.statusText}
                    </div>
                    <pre>\${formatJson(data)}</pre>
                \`;
                
            } catch (error) {
                responseBox.innerHTML = \`Error: \${error.message}\`;
            }
        }
        
        // Get server stats
        async function getServerStats() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                document.getElementById('memoryUsage').textContent = 
                    \`\${Math.round(data.memoryUsage / 1024 / 1024)} MB\`;
            } catch {
                // Fallback jika endpoint stats tidak ada
                const mem = process.memoryUsage ? 
                    Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB' : 
                    'N/A';
                document.getElementById('memoryUsage').textContent = mem;
            }
        }
        
        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => showNotification('Copied to clipboard!'))
                .catch(err => showNotification('Copy failed: ' + err, 'error'));
        }
        
        // Initialize
        setInterval(updateUptime, 1000);
        updateUptime();
        
        // Add stats endpoint untuk monitoring
        fetch('/api/stats').catch(() => {
            // Create stats endpoint jika belum ada
            fetch(baseUrl + '/api/stats', {
                method: 'HEAD'
            }).catch(() => {
                // Endpoint tidak ada, tidak apa-apa
            });
        });
        
        // Auto-test pertama untuk demo
        setTimeout(() => {
            if (window.location.search.includes('autotest')) {
                testEndpoint('recommended');
            }
        }, 1000);
    </script>
</body>
</html>
    `;
    
    res.send(html);
});

// ==================== STATS ENDPOINT ====================
// Endpoint tambahan untuk monitoring

app.get('/api/stats', (req, res) => {
    const stats = {
        status: 'online',
        timestamp: new Date().toISOString(),
        server: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform
        },
        memoryUsage: process.memoryUsage().heapUsed,
        uptime: process.uptime(),
        endpoints: {
            total: 12,
            active: true
        }
    };
    
    // Tambahkan pretty print support untuk endpoint ini juga
    const isPretty = req.query.pretty === 'true';
    if (isPretty) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(stats, null, 2));
    } else {
        res.json(stats);
    }
});

// ==================== PRESERVE PRETTY PRINT MIDDLEWARE ====================
// Tetap pertahankan pretty print middleware untuk API endpoints

app.use((req, res, next) => {
    // Skip middleware untuk root endpoint (karena kita pakai HTML)
    if (req.path === '/' || req.path === '') {
        return next();
    }
    
    const originalJson = res.json;
    res.json = function(data) {
        const isPretty = req.query.pretty === 'true' || 
                        req.query.format === 'pretty' || 
                        req.query.p === '1';
        
        if (isPretty) {
            const indent = parseInt(req.query.indent) || 2;
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.stringify(data, null, indent));
        }
        return originalJson.call(this, data);
    };
    next();
});

// ==================== DRAMA ENDPOINTS ====================

// Get drama list
app.get('/api/drama/list', async (req, res) => {
    try {
        const { pageNo = 1, log = false } = req.query;
        const data = await getDramaList(parseInt(pageNo), log === 'true');
        res.json({
            success: true,
            data,
            page: parseInt(pageNo)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get categories
app.get('/api/drama/categories', async (req, res) => {
    try {
        const { pageNo = 1 } = req.query;
        const data = await getCategories(parseInt(pageNo));
        res.json({
            success: true,
            data,
            page: parseInt(pageNo)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get books from category
app.get('/api/drama/category/:typeTwoId', async (req, res) => {
    try {
        const { typeTwoId } = req.params;
        const { pageNo = 1 } = req.query;
        const data = await getBookFromCategories(parseInt(typeTwoId), parseInt(pageNo));
        res.json({
            success: true,
            data,
            categoryId: parseInt(typeTwoId),
            page: parseInt(pageNo)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recommended books
app.get('/api/drama/recommended', async (req, res) => {
    try {
        const { log = false } = req.query;
        const data = await getRecommendedBooks(log === 'true');
        res.json({
            success: true,
            data,
            total: data.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get drama detail
app.get('/api/drama/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const { needRecommend = false } = req.query;
        const data = await getDramaDetail(bookId, needRecommend === 'true');
        res.json({
            success: true,
            data,
            bookId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get drama detail v2
app.get('/api/drama/:bookId/v2', async (req, res) => {
    try {
        const { bookId } = req.params;
        const data = await getDetailsv2(bookId);
        res.json({
            success: true,
            data,
            bookId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== CHAPTER ENDPOINTS ====================

// Get chapters
app.get('/api/chapter/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const { log = false } = req.query;
        const data = await getChapters(bookId, log === 'true');
        res.json({
            success: true,
            data,
            bookId,
            total: data.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Batch download chapters
app.post('/api/chapter/batch-download', async (req, res) => {
    try {
        const { bookId, chapterIdList } = req.body;
        
        if (!bookId || !chapterIdList || !Array.isArray(chapterIdList)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. Requires bookId and chapterIdList array'
            });
        }
        
        const data = await batchDownload(bookId, chapterIdList);
        res.json({
            success: true,
            data,
            bookId,
            chaptersCount: chapterIdList.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== SEARCH ENDPOINTS ====================

// Search drama
app.get('/api/search', async (req, res) => {
    try {
        const { keyword, log = false } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: 'Keyword is required'
            });
        }
        
        const data = await searchDrama(keyword, log === 'true');
        res.json({
            success: true,
            data,
            keyword,
            total: data.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get hot search list
app.get('/api/search/hot', async (req, res) => {
    try {
        const { log = false } = req.query;
        const data = await searchDramaIndex(log === 'true');
        res.json({
            success: true,
            data,
            total: data.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.url
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║       DramaBox API Server             ║
║          by lannzephry                ║
╠═══════════════════════════════════════╣
║  🚀 Server running on port ${PORT}      ║
║  📍 URL: http://localhost:${PORT}        ║
║  📚 API Docs: http://localhost:${PORT}/  ║
╚═══════════════════════════════════════╝
    `);
});

export default app;