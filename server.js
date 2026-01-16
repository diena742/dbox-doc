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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>DramaBox API Documentation</title>
    <style>
        :root {
            --primary: #4361ee;
            --secondary: #3a0ca3;
            --accent: #f72585;
            --success: #4cc9f0;
            --dark: #0f0c29;
            --darker: #080616;
            --light: #f8f9fa;
            --gray: #6c757d;
            --card-bg: rgba(255, 255, 255, 0.05);
            --card-border: rgba(255, 255, 255, 0.1);
            --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, var(--darker), var(--dark), #24243e);
            color: var(--light);
            min-height: 100vh;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            padding: 0;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: clamp(15px, 3vw, 25px);
            width: 100%;
        }
        
        /* ========== HEADER ========== */
        header {
            text-align: center;
            padding: clamp(25px, 5vw, 40px) 0;
            margin-bottom: clamp(20px, 4vw, 35px);
            position: relative;
            overflow: hidden;
        }
        
        header::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(76, 201, 240, 0.1) 0%, transparent 70%);
            z-index: -1;
        }
        
        .logo {
            font-size: clamp(2rem, 6vw, 3.5rem);
            font-weight: 800;
            margin-bottom: clamp(10px, 2vw, 15px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .logo-icon {
            background: linear-gradient(135deg, var(--accent), var(--primary));
            width: clamp(50px, 10vw, 70px);
            height: clamp(50px, 10vw, 70px);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(1.5rem, 4vw, 2.2rem);
            box-shadow: var(--shadow);
        }
        
        .logo-text {
            background: linear-gradient(90deg, var(--success), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 5px 15px rgba(76, 201, 240, 0.3);
        }
        
        .subtitle {
            font-size: clamp(0.9rem, 2.5vw, 1.2rem);
            color: rgba(255, 255, 255, 0.7);
            max-width: 800px;
            margin: 0 auto clamp(20px, 4vw, 30px);
            line-height: 1.7;
        }
        
        .server-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: clamp(15px, 3vw, 25px);
            flex-wrap: wrap;
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            padding: clamp(12px, 2.5vw, 18px) clamp(20px, 4vw, 30px);
            border-radius: 15px;
            border: 1px solid var(--card-border);
            max-width: 800px;
            margin: 0 auto;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: clamp(0.8rem, 2vw, 0.95rem);
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            position: relative;
        }
        
        .status-online {
            background: #10b981;
            box-shadow: 0 0 15px #10b981;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        /* ========== MAIN CONTENT ========== */
        .main-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(20px, 4vw, 30px);
        }
        
        @media (min-width: 768px) {
            .main-content {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (min-width: 1200px) {
            .main-content {
                grid-template-columns: 1.2fr 0.8fr;
            }
        }
        
        /* ========== INFO BOXES ========== */
        .info-box {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: clamp(20px, 4vw, 30px);
            border: 1px solid var(--card-border);
            margin-bottom: clamp(20px, 4vw, 30px);
            transition: var(--transition);
        }
        
        .info-box:hover {
            transform: translateY(-5px);
            border-color: var(--success);
            box-shadow: 0 15px 35px rgba(76, 201, 240, 0.15);
        }
        
        .info-box h3 {
            font-size: clamp(1.2rem, 3vw, 1.5rem);
            margin-bottom: clamp(15px, 3vw, 20px);
            color: var(--success);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-box h3::before {
            content: '📚';
            font-size: 1.5em;
        }
        
        /* ========== ENDPOINT GROUPS ========== */
        .endpoint-group {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: clamp(20px, 4vw, 30px);
            border: 1px solid var(--card-border);
            margin-bottom: clamp(25px, 5vw, 40px);
        }
        
        .group-title {
            font-size: clamp(1.3rem, 3.5vw, 1.8rem);
            color: var(--success);
            margin-bottom: clamp(20px, 4vw, 30px);
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(76, 201, 240, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .endpoint-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(15px, 3vw, 25px);
        }
        
        @media (min-width: 640px) {
            .endpoint-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (min-width: 1024px) {
            .endpoint-container {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        /* ========== ENDPOINT CARDS ========== */
        .endpoint-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: clamp(18px, 3.5vw, 25px);
            border: 1px solid var(--card-border);
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .endpoint-card:hover {
            transform: translateY(-8px);
            border-color: var(--accent);
            box-shadow: 0 15px 35px rgba(247, 37, 133, 0.2);
        }
        
        .method {
            display: inline-flex;
            align-items: center;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.85rem;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: fit-content;
        }
        
        .method.get { 
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        .method.post { 
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        
        .endpoint-path {
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
            background: rgba(0, 0, 0, 0.4);
            padding: clamp(12px, 2.5vw, 15px);
            border-radius: 12px;
            margin: 12px 0;
            word-break: break-all;
            border-left: 4px solid var(--success);
            font-size: clamp(0.85rem, 2vw, 0.95rem);
            line-height: 1.5;
        }
        
        .endpoint-desc {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 15px;
            font-size: 0.95rem;
            flex-grow: 1;
        }
        
        .param-list {
            margin: 15px 0;
        }
        
        .param {
            margin: 10px 0;
            padding-left: 15px;
            border-left: 2px solid var(--accent);
            font-size: 0.9rem;
        }
        
        .param-name {
            color: var(--success);
            font-weight: 600;
            display: inline-block;
            margin-right: 5px;
        }
        
        /* ========== INPUT CONTROLS ========== */
        .input-group {
            margin: 12px 0;
        }
        
        .input-label {
            display: block;
            margin-bottom: 6px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        input, select, textarea {
            width: 100%;
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            font-family: inherit;
            transition: var(--transition);
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--success);
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 3px rgba(76, 201, 240, 0.1);
        }
        
        /* ========== BUTTONS ========== */
        .btn-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .btn {
            padding: clamp(10px, 2vw, 14px) clamp(18px, 3vw, 24px);
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: clamp(0.85rem, 2vw, 0.95rem);
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            text-decoration: none;
            flex: 1;
            min-width: fit-content;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(67, 97, 238, 0.3);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-3px);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        .btn-accent {
            background: linear-gradient(135deg, var(--accent), #b5179e);
            color: white;
        }
        
        /* ========== RESPONSE BOX ========== */
        .response-container {
            margin-top: 20px;
        }
        
        .response-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .response-title {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .response-box {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 12px;
            padding: clamp(15px, 3vw, 20px);
            font-family: 'JetBrains Mono', monospace;
            font-size: clamp(0.8rem, 2vw, 0.9rem);
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            line-height: 1.6;
        }
        
        /* ========== SIDEBAR ========== */
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: clamp(20px, 4vw, 30px);
        }
        
        @media (max-width: 767px) {
            .sidebar {
                order: -1;
            }
        }
        
        /* ========== QUICK TEST ========== */
        .quick-test {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: clamp(20px, 4vw, 30px);
            border: 1px solid var(--card-border);
        }
        
        .quick-test-input {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        @media (max-width: 640px) {
            .quick-test-input {
                flex-direction: column;
            }
        }
        
        /* ========== SERVER INFO ========== */
        .server-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
        }
        
        .info-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--success);
            margin-top: 5px;
        }
        
        /* ========== LOADING ========== */
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: var(--success);
        }
        
        .loading.active {
            display: block;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(76, 201, 240, 0.3);
            border-radius: 50%;
            border-top-color: var(--success);
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* ========== NOTIFICATION ========== */
        .notification {
            position: fixed;
            top: 25px;
            right: 25px;
            padding: 15px 25px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 350px;
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow);
        }
        
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .notification.success {
            background: rgba(16, 185, 129, 0.9);
            border-left: 5px solid #059669;
        }
        
        .notification.error {
            background: rgba(239, 68, 68, 0.9);
            border-left: 5px solid #dc2626;
        }
        
        /* ========== MOBILE MENU ========== */
        .mobile-menu-btn {
            display: none;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 20px;
            width: 100%;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        
        @media (max-width: 767px) {
            .mobile-menu-btn {
                display: flex;
            }
            
            .main-content {
                display: none;
            }
            
            .main-content.show {
                display: grid;
            }
        }
        
        /* ========== FOOTER ========== */
        footer {
            text-align: center;
            padding: clamp(25px, 5vw, 40px) 0;
            margin-top: clamp(30px, 6vw, 50px);
            border-top: 1px solid var(--card-border);
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
        }
        
        /* ========== UTILITY ========== */
        .copy-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        
        .badge {
            background: var(--accent);
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
        }
        
        /* ========== TOUCH OPTIMIZATIONS ========== */
        @media (hover: none) {
            .btn, .endpoint-card, .copy-btn {
                min-height: 44px; /* Minimum touch target size */
            }
            
            input, select, textarea {
                font-size: 16px; /* Prevents iOS zoom on focus */
            }
        }
        
        /* ========== DARK MODE SUPPORT ========== */
        @media (prefers-color-scheme: light) {
            :root {
                --dark: #f8f9fa;
                --darker: #e9ecef;
                --light: #212529;
                --card-bg: rgba(0, 0, 0, 0.05);
                --card-border: rgba(0, 0, 0, 0.1);
            }
            
            .endpoint-path, .response-box {
                background: rgba(0, 0, 0, 0.05);
            }
        }
        
        /* ========== PRINT STYLES ========== */
        @media print {
            .btn, .mobile-menu-btn, .notification {
                display: none !important;
            }
            
            body {
                background: white !important;
                color: black !important;
            }
            
            .endpoint-card {
                break-inside: avoid;
                border: 1px solid #ddd !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <span>📱 Menu</span>
            <span id="menuIcon">▼</span>
        </button>
        
        <!-- Header -->
        <header>
            <div class="logo">
                <div class="logo-icon">🎭</div>
                <div class="logo-text">DramaBox API</div>
            </div>
            <p class="subtitle">
                Interactive API Documentation with real-time testing. 
                Test endpoints directly from your browser on any device.
            </p>
            <div class="server-status">
                <div class="status-item">
                    <span class="status-indicator status-online"></span>
                    <span>Status: <strong>Online</strong></span>
                </div>
                <div class="status-item">
                    <span>🌐</span>
                    <span>Port: <strong>${PORT}</strong></span>
                </div>
                <div class="status-item">
                    <span>📱</span>
                    <span>Responsive: <strong>Yes</strong></span>
                </div>
                <div class="status-item">
                    <span>⚡</span>
                    <span>Version: <strong>1.0.0</strong></span>
                </div>
            </div>
        </header>
        
        <!-- Main Content -->
        <div class="main-content" id="mainContent">
            <!-- Left Column -->
            <div class="left-column">
                <!-- Quick Test Section -->
                <div class="quick-test info-box">
                    <h3>⚡ Quick API Test</h3>
                    <p>Test any endpoint directly:</p>
                    <div class="quick-test-input">
                        <input type="text" id="quickEndpoint" 
                               placeholder="/api/drama/list?pageNo=1" 
                               style="flex: 1;">
                        <button class="btn btn-primary" onclick="quickTest()">
                            Test
                        </button>
                        <button class="btn btn-secondary" onclick="quickTest(true)">
                            Pretty
                        </button>
                    </div>
                    <div class="response-container" style="margin-top: 20px;">
                        <div class="response-box" id="response-quick">
                            {/* Response will appear here */}
                        </div>
                    </div>
                </div>
                
                <!-- Drama Endpoints -->
                <div class="endpoint-group">
                    <h2 class="group-title">
                        🎬 Drama Endpoints
                        <span class="badge">6 endpoints</span>
                    </h2>
                    <div class="endpoint-container">
                        ${generateEndpointCard('dramaList', 'GET', '/api/drama/list', 'Get paginated list of dramas', [
                            {name: 'pageNo', desc: 'Page number (default: 1)', type: 'number'},
                            {name: 'log', desc: 'Enable logging', type: 'boolean'}
                        ])}
                        
                        ${generateEndpointCard('dramaDetail', 'GET', '/api/drama/:bookId', 'Get details of a specific drama', [
                            {name: 'bookId', desc: 'Drama ID (required)', type: 'string'},
                            {name: 'needRecommend', desc: 'Include recommendations', type: 'boolean'}
                        ])}
                        
                        ${generateEndpointCard('categories', 'GET', '/api/drama/categories', 'Get list of drama categories', [
                            {name: 'pageNo', desc: 'Page number', type: 'number'}
                        ])}
                        
                        ${generateEndpointCard('recommended', 'GET', '/api/drama/recommended', 'Get recommended dramas', [
                            {name: 'log', desc: 'Enable logging', type: 'boolean'}
                        ])}
                        
                        ${generateEndpointCard('categoryBooks', 'GET', '/api/drama/category/:typeTwoId', 'Get books from category', [
                            {name: 'typeTwoId', desc: 'Category ID (required)', type: 'number'},
                            {name: 'pageNo', desc: 'Page number', type: 'number'}
                        ])}
                        
                        ${generateEndpointCard('detailV2', 'GET', '/api/drama/:bookId/v2', 'Get drama details (v2)', [
                            {name: 'bookId', desc: 'Drama ID (required)', type: 'string'}
                        ])}
                    </div>
                </div>
                
                <!-- Chapter Endpoints -->
                <div class="endpoint-group">
                    <h2 class="group-title">
                        📖 Chapter Endpoints
                        <span class="badge">2 endpoints</span>
                    </h2>
                    <div class="endpoint-container">
                        ${generateEndpointCard('chapterList', 'GET', '/api/chapter/:bookId', 'Get chapters of a drama', [
                            {name: 'bookId', desc: 'Drama ID (required)', type: 'string'},
                            {name: 'log', desc: 'Enable logging', type: 'boolean'}
                        ])}
                        
                        ${generateEndpointCard('batchDownload', 'POST', '/api/chapter/batch-download', 'Batch download multiple chapters', [
                            {name: 'bookId', desc: 'Drama ID (required)', type: 'string'},
                            {name: 'chapterIdList', desc: 'Array of chapter IDs', type: 'array'}
                        ], true)}
                    </div>
                </div>
                
                <!-- Search Endpoints -->
                <div class="endpoint-group">
                    <h2 class="group-title">
                        🔍 Search Endpoints
                        <span class="badge">2 endpoints</span>
                    </h2>
                    <div class="endpoint-container">
                        ${generateEndpointCard('search', 'GET', '/api/search', 'Search dramas by keyword', [
                            {name: 'keyword', desc: 'Search term (required)', type: 'string'},
                            {name: 'log', desc: 'Enable logging', type: 'boolean'}
                        ])}
                        
                        ${generateEndpointCard('hotSearch', 'GET', '/api/search/hot', 'Get trending search terms', [
                            {name: 'log', desc: 'Enable logging', type: 'boolean'}
                        ])}
                    </div>
                </div>
            </div>
            
            <!-- Right Column (Sidebar) -->
            <div class="sidebar">
                <!-- API Information -->
                <div class="info-box">
                    <h3>📚 API Information</h3>
                    <p><strong>Base URL:</strong> <code>http://${req.headers.host}</code></p>
                    <p><strong>Default Port:</strong> ${PORT}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <p><strong>JSON Formatting:</strong> Add <code>?pretty=true</code> to any endpoint</p>
                    <div class="server-info-grid">
                        <div class="info-item">
                            <div>Total Endpoints</div>
                            <div class="info-value">10</div>
                        </div>
                        <div class="info-item">
                            <div>Uptime</div>
                            <div class="info-value" id="uptime">0s</div>
                        </div>
                        <div class="info-item">
                            <div>Memory</div>
                            <div class="info-value" id="memoryUsage">-</div>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="getServerStats()" style="margin-top: 15px; width: 100%;">
                        🔄 Refresh Stats
                    </button>
                </div>
                
                <!-- How to Use -->
                <div class="info-box">
                    <h3>🚀 How to Use</h3>
                    <ol style="padding-left: 20px; margin-top: 10px;">
                        <li>Select an endpoint from the cards</li>
                        <li>Fill in the required parameters</li>
                        <li>Click "Test Endpoint" to execute</li>
                        <li>View the response in the box below</li>
                        <li>Use "Copy" button to save results</li>
                    </ol>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7);">
                        <strong>Tip:</strong> On mobile, rotate to landscape for better view of response data.
                    </p>
                </div>
                
                <!-- Test All Button -->
                <div class="info-box">
                    <h3>🧪 Batch Testing</h3>
                    <p>Test multiple endpoints at once:</p>
                    <button class="btn btn-accent" onclick="runAllTests()" style="width: 100%; margin-top: 10px;">
                        🚀 Run All Tests
                    </button>
                    <button class="btn btn-secondary" onclick="clearAllResponses()" style="width: 100%; margin-top: 10px;">
                        🗑️ Clear All Responses
                    </button>
                </div>
                
                <!-- Device Info -->
                <div class="info-box">
                    <h3>📱 Device Info</h3>
                    <div id="deviceInfo">
                        {/* Device info will be populated by JS */}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <footer>
            <p>DramaBox API Documentation • Built with RSMEDIAZERO Technology</p>
            <p style="margin-top: 10px; font-size: 0.8rem;">
                Fully responsive design • Works on mobile, tablet, and desktop
            </p>
        </footer>
    </div>
    
    <!-- Notification -->
    <div class="notification" id="notification"></div>
    
    <!-- Loading Overlay -->
    <div class="loading" id="loadingOverlay">
        <div class="spinner"></div>
        <div>Processing request...</div>
    </div>
    
    <script>
        // Helper function to generate endpoint HTML
        function generateEndpointCard(id, method, path, description, params = [], isPost = false) {
            const paramInputs = params.map(param => {
                if (param.type === 'boolean') {
                    return \`
                        <div class="input-group">
                            <div class="input-label">\${param.name}</div>
                            <select id="\${id}_\${param.name}">
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>
                    \`;
                } else if (param.type === 'array') {
                    return \`
                        <div class="input-group">
                            <div class="input-label">\${param.name}</div>
                            <textarea id="\${id}_\${param.name}" 
                                      placeholder="Enter as JSON array, e.g., [1, 2, 3]"
                                      rows="2">[1, 2, 3]</textarea>
                        </div>
                    \`;
                } else {
                    return \`
                        <div class="input-group">
                            <div class="input-label">\${param.name}</div>
                            <input type="\${param.type === 'number' ? 'number' : 'text'}" 
                                   id="\${id}_\${param.name}" 
                                   placeholder="\${param.desc}"
                                   value="\${param.type === 'number' ? '1' : ''}">
                        </div>
                    \`;
                }
            }).join('');
            
            return \`
                <div class="endpoint-card">
                    <span class="method \${method.toLowerCase()}">\${method}</span>
                    <div class="endpoint-path">\${path}</div>
                    <p class="endpoint-desc">\${description}</p>
                    <div class="param-list">
                        \${params.map(p => \`
                            <div class="param">
                                <span class="param-name">\${p.name}</span>
                                <span>\${p.desc}</span>
                            </div>
                        \`).join('')}
                    </div>
                    \${paramInputs}
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="testEndpoint('\${id}', \${isPost})">
                            🚀 Test Endpoint
                        </button>
                        <button class="btn btn-secondary" onclick="testEndpoint('\${id}', \${isPost}, true)">
                            ✨ Pretty
                        </button>
                    </div>
                    <div class="response-container">
                        <div class="response-header">
                            <div class="response-title">Response:</div>
                            <button class="copy-btn" onclick="copyResponse('\${id}')">
                                📋 Copy
                            </button>
                        </div>
                        <div class="response-box" id="response-\${id}">
                            {/* Response will appear here */}
                        </div>
                    </div>
                </div>
            \`;
        }
        
        // Core JavaScript functionality
        const baseUrl = window.location.origin;
        const startTime = new Date();
        
        // Mobile menu toggle
        document.getElementById('mobileMenuBtn').addEventListener('click', function() {
            const mainContent = document.getElementById('mainContent');
            const icon = document.getElementById('menuIcon');
            const isVisible = mainContent.classList.contains('show');
            
            if (isVisible) {
                mainContent.classList.remove('show');
                icon.textContent = '▼';
            } else {
                mainContent.classList.add('show');
                icon.textContent = '▲';
            }
        });
        
        // Detect device type
        function detectDevice() {
            const width = window.innerWidth;
            let device = 'Desktop';
            
            if (width < 768) device = 'Mobile';
            else if (width < 1024) device = 'Tablet';
            
            document.getElementById('deviceInfo').innerHTML = \`
                <p><strong>Screen:</strong> \${width} × \${window.innerHeight}px</p>
                <p><strong>Device:</strong> \${device}</p>
                <p><strong>Orientation:</strong> \${width > window.innerHeight ? 'Landscape' : 'Portrait'}</p>
            \`;
        }
        
        // Update uptime
        function updateUptime() {
            const now = new Date();
            const diff = Math.floor((now - startTime) / 1000);
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            
            let uptime = '';
            if (hours > 0) uptime += \`\${hours}h \`;
            if (minutes > 0) uptime += \`\${minutes}m \`;
            uptime += \`\${seconds}s\`;
            
            document.getElementById('uptime').textContent = uptime;
        }
        
        // Show notification
        function showNotification(message, type = 'success', duration = 3000) {
            const notif = document.getElementById('notification');
            notif.textContent = message;
            notif.className = \`notification \${type} show\`;
            
            setTimeout(() => {
                notif.classList.remove('show');
            }, duration);
        }
        
        // Show/hide loading
        function showLoading(show) {
            document.getElementById('loadingOverlay').classList.toggle('active', show);
        }
        
        // Test endpoint
        async function testEndpoint(endpointId, isPost = false, pretty = false) {
            showLoading(true);
            const responseBox = document.getElementById(\`response-\${endpointId}\`);
            responseBox.innerHTML = '<div style="color: #4cc9f0; text-align: center;">⏳ Testing endpoint...</div>';
            
            try {
                let url = baseUrl;
                let options = { method: isPost ? 'POST' : 'GET' };
                
                // Construct URL based on endpoint
                switch(endpointId) {
                    case 'dramaList':
                        const page = document.getElementById('dramaList_pageNo')?.value || 1;
                        const log = document.getElementById('dramaList_log')?.value || 'false';
                        url += \`/api/drama/list?pageNo=\${page}&log=\${log}\`;
                        break;
                    case 'dramaDetail':
                        const bookId = document.getElementById('dramaDetail_bookId')?.value || '1';
                        const needRecommend = document.getElementById('dramaDetail_needRecommend')?.value || 'false';
                        url += \`/api/drama/\${bookId}?needRecommend=\${needRecommend}\`;
                        break;
                    case 'categories':
                        const catPage = document.getElementById('categories_pageNo')?.value || 1;
                        url += \`/api/drama/categories?pageNo=\${catPage}\`;
                        break;
                    case 'recommended':
                        const recLog = document.getElementById('recommended_log')?.value || 'false';
                        url += \`/api/drama/recommended?log=\${recLog}\`;
                        break;
                    case 'categoryBooks':
                        const typeTwoId = document.getElementById('categoryBooks_typeTwoId')?.value || '1';
                        const catPageNo = document.getElementById('categoryBooks_pageNo')?.value || 1;
                        url += \`/api/drama/category/\${typeTwoId}?pageNo=\${catPageNo}\`;
                        break;
                    case 'detailV2':
                        const v2BookId = document.getElementById('detailV2_bookId')?.value || '1';
                        url += \`/api/drama/\${v2BookId}/v2\`;
                        break;
                    case 'chapterList':
                        const chapBookId = document.getElementById('chapterList_bookId')?.value || '1';
                        const chapLog = document.getElementById('chapterList_log')?.value || 'false';
                        url += \`/api/chapter/\${chapBookId}?log=\${chapLog}\`;
                        break;
                    case 'batchDownload':
                        const batchBookId = document.getElementById('batchDownload_bookId')?.value || '1';
                        const chapterIds = document.getElementById('batchDownload_chapterIdList')?.value || '[1, 2, 3]';
                        url += '/api/chapter/batch-download';
                        options = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                bookId: batchBookId,
                                chapterIdList: JSON.parse(chapterIds)
                            })
                        };
                        break;
                    case 'search':
                        const keyword = document.getElementById('search_keyword')?.value || 'drama';
                        const searchLog = document.getElementById('search_log')?.value || 'false';
                        url += \`/api/search?keyword=\${encodeURIComponent(keyword)}&log=\${searchLog}\`;
                        break;
                    case 'hotSearch':
                        const hotLog = document.getElementById('hotSearch_log')?.value || 'false';
                        url += \`/api/search/hot?log=\${hotLog}\`;
                        break;
                }
                
                // Add pretty parameter if requested
                if (pretty && !url.includes('?')) {
                    url += '?pretty=true';
                } else if (pretty) {
                    url += '&pretty=true';
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                // Format the response
                const formatted = JSON.stringify(data, null, 2);
                responseBox.innerHTML = \`
                    <div style="margin-bottom: 10px; padding: 8px; background: \${response.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 6px; border-left: 4px solid \${response.ok ? '#10b981' : '#ef4444'};">
                        <strong>Status:</strong> \${response.status} \${response.statusText}<br>
                        <strong>URL:</strong> \${url}
                    </div>
                    <pre style="margin: 0;">\${formatted}</pre>
                \`;
                
                showNotification(\`\${endpointId} tested successfully!\`, 'success');
                
            } catch (error) {
                responseBox.innerHTML = \`
                    <div style="color: #ef4444; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 6px;">
                        <strong>Error:</strong> \${error.message}<br>
                        \${error.stack ? \`<small>\${error.stack}</small>\` : ''}
                    </div>
                \`;
                showNotification(\`Test failed: \${error.message}\`, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Quick test function
        async function quickTest(pretty = false) {
            const endpoint = document.getElementById('quickEndpoint').value.trim();
            if (!endpoint) {
                showNotification('Please enter an endpoint', 'error');
                return;
            }
            
            showLoading(true);
            const responseBox = document.getElementById('response-quick');
            responseBox.innerHTML = '<div style="color: #4cc9f0; text-align: center;">⏳ Testing...</div>';
            
            try {
                let url = baseUrl + endpoint;
                if (pretty && !url.includes('?')) {
                    url += '?pretty=true';
                } else if (pretty) {
                    url += '&pretty=true';
                }
                
                const response = await fetch(url);
                const data = await response.json();
                
                const formatted = JSON.stringify(data, null, 2);
                responseBox.innerHTML = \`
                    <div style="margin-bottom: 10px; padding: 8px; background: \${response.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 6px;">
                        <strong>URL:</strong> \${url}<br>
                        <strong>Status:</strong> \${response.status} \${response.statusText}
                    </div>
                    <pre style="margin: 0;">\${formatted}</pre>
                \`;
                
                showNotification('Quick test successful!', 'success');
                
            } catch (error) {
                responseBox.innerHTML = \`<div style="color: #ef4444;">Error: \${error.message}</div>\`;
                showNotification(\`Test failed: \${error.message}\`, 'error');
            } finally {
                showLoading(false);
            }
        }
        
        // Get server stats
        async function getServerStats() {
            try {
                const response = await fetch(baseUrl + '/api/stats?pretty=true');
                const data = await response.json();
                
                const memoryMB = Math.round(data.memoryUsage / 1024 / 1024);
                document.getElementById('memoryUsage').textContent = \`\${memoryMB} MB\`;
                
                showNotification('Server stats updated!', 'success');
            } catch (error) {
                // Fallback if stats endpoint doesn't exist
                if (window.performance && window.performance.memory) {
                    const mem = window.performance.memory.usedJSHeapSize;
                    const memoryMB = Math.round(mem / 1024 / 1024);
                    document.getElementById('memoryUsage').textContent = \`\${memoryMB} MB (client)\`;
                }
            }
        }
        
        // Copy response to clipboard
        async function copyResponse(endpointId) {
            const responseBox = document.getElementById(\`response-\${endpointId}\`);
            const text = responseBox.innerText || responseBox.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                showNotification('Response copied to clipboard!', 'success');
            } catch (err) {
                showNotification('Failed to copy: ' + err, 'error');
            }
        }
        
        // Run all tests
        async function runAllTests() {
            const endpoints = ['recommended', 'dramaList', 'categories', 'hotSearch'];
            showNotification('Running all tests...', 'success');
            
            for (const endpoint of endpoints) {
                await testEndpoint(endpoint);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
            }
            
            showNotification('All tests completed!', 'success');
        }
        
        // Clear all responses
        function clearAllResponses() {
            document.querySelectorAll('.response-box').forEach(box => {
                box.innerHTML = '';
            });
            showNotification('All responses cleared', 'success');
        }
        
        // Initialize
        function init() {
            detectDevice();
            updateUptime();
            getServerStats();
            
            // Auto-update uptime every second
            setInterval(updateUptime, 1000);
            
            // Update device info on resize
            window.addEventListener('resize', detectDevice);
            
            // Auto-test if URL has parameter
            if (window.location.search.includes('autotest')) {
                setTimeout(() => testEndpoint('recommended'), 1000);
            }
            
            // Add enter key support for quick test
            document.getElementById('quickEndpoint').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') quickTest();
            });
            
            // Show welcome message
            setTimeout(() => {
                showNotification('Welcome to DramaBox API Documentation!', 'success', 5000);
            }, 1000);
        }
        
        // Start when page loads
        window.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
    `;
    
    res.send(html);
});

// Helper function untuk generate endpoint HTML (di server side)
function generateEndpointCard(id, method, path, description, params = [], isPost = false) {
    const paramList = params.map(p => 
        `<div class="param">
            <span class="param-name">${p.name}</span>
            <span>${p.desc}</span>
        </div>`
    ).join('');
    
    return `
        <div class="endpoint-card">
            <span class="method ${method.toLowerCase()}">${method}</span>
            <div class="endpoint-path">${path}</div>
            <p class="endpoint-desc">${description}</p>
            <div class="param-list">${paramList}</div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="testEndpoint('${id}', ${isPost})">
                    🚀 Test Endpoint
                </button>
                <button class="btn btn-secondary" onclick="testEndpoint('${id}', ${isPost}, true)">
                    ✨ Pretty
                </button>
            </div>
            <div class="response-container">
                <div class="response-header">
                    <div class="response-title">Response:</div>
                    <button class="copy-btn" onclick="copyResponse('${id}')">
                        📋 Copy
                    </button>
                </div>
                <div class="response-box" id="response-${id}"></div>
            </div>
        </div>
    `;
}

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
