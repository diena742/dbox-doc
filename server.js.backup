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

// ==================== API ROUTES ====================

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'DramaBox API Server',
        version: '1.0.0',
        author: 'lannzephry',
        endpoints: {
            drama: {
                list: 'GET /api/drama/list',
                categories: 'GET /api/drama/categories',
                categoryBooks: 'GET /api/drama/category/:typeTwoId',
                recommended: 'GET /api/drama/recommended',
                detail: 'GET /api/drama/:bookId',
                detailV2: 'GET /api/drama/:bookId/v2'
            },
            chapter: {
                list: 'GET /api/chapter/:bookId',
                batchDownload: 'POST /api/chapter/batch-download'
            },
            search: {
                query: 'GET /api/search',
                hotList: 'GET /api/search/hot'
            }
        }
    });
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
