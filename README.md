# DramaBox API Server

RESTful API server untuk mengakses konten drama dari DramaBox.

**Created by lannzephry**

## 🚀 Quick Start

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

Server akan berjalan di `http://localhost:3000` (default)

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Response Format
Semua response menggunakan format JSON dengan struktur:

```json
{
  "success": true,
  "data": {...},
  "message": "optional message"
}
```

## 🎬 Drama Endpoints

### Get Drama List
```http
GET /api/drama/list?pageNo=1&log=false
```

**Query Parameters:**
- `pageNo` (number, optional): Nomor halaman, default: 1
- `log` (boolean, optional): Tampilkan log di console, default: false

**Response:**
```json
{
  "success": true,
  "data": [...],
  "page": 1
}
```

### Get Categories
```http
GET /api/drama/categories?pageNo=1
```

**Query Parameters:**
- `pageNo` (number, optional): Nomor halaman, default: 1

### Get Books by Category
```http
GET /api/drama/category/:typeTwoId?pageNo=1
```

**Path Parameters:**
- `typeTwoId` (number): ID kategori

**Query Parameters:**
- `pageNo` (number, optional): Nomor halaman, default: 1

### Get Recommended Books
```http
GET /api/drama/recommended?log=false
```

**Query Parameters:**
- `log` (boolean, optional): Tampilkan log di console, default: false

### Get Drama Detail
```http
GET /api/drama/:bookId?needRecommend=false
```

**Path Parameters:**
- `bookId` (string): ID buku/drama

**Query Parameters:**
- `needRecommend` (boolean, optional): Include rekomendasi, default: false

### Get Drama Detail V2
```http
GET /api/drama/:bookId/v2
```

**Path Parameters:**
- `bookId` (string): ID buku/drama

## 📖 Chapter Endpoints

### Get Chapters
```http
GET /api/chapter/:bookId?log=false
```

**Path Parameters:**
- `bookId` (string): ID buku/drama

**Query Parameters:**
- `log` (boolean, optional): Tampilkan log di console, default: false

**Response:**
```json
{
  "success": true,
  "data": [...],
  "bookId": "123",
  "total": 10
}
```

### Batch Download Chapters
```http
POST /api/chapter/batch-download
```

**Request Body:**
```json
{
  "bookId": "123",
  "chapterIdList": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "bookId": "123",
  "chaptersCount": 5
}
```

## 🔍 Search Endpoints

### Search Drama
```http
GET /api/search?keyword=drama&log=false
```

**Query Parameters:**
- `keyword` (string, required): Kata kunci pencarian
- `log` (boolean, optional): Tampilkan log di console, default: false

**Response:**
```json
{
  "success": true,
  "data": [...],
  "keyword": "drama",
  "total": 10
}
```

### Get Hot Search List
```http
GET /api/search/hot?log=false
```

**Query Parameters:**
- `log` (boolean, optional): Tampilkan log di console, default: false

## 🛠️ Error Handling

Semua error akan mengembalikan response dengan format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (parameter tidak valid)
- `404` - Not Found (endpoint tidak ditemukan)
- `500` - Internal Server Error

## 📝 Environment Variables

Buat file `.env` di root directory:

```env
# Server Configuration
PORT=3000

# API Settings
API_VERSION=1.0.0
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

## 📦 Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `axios` - HTTP client
- `dotenv` - Environment variables
- `uuid` - UUID generator
- `nodemon` - Development server (dev dependency)

## 🏗️ Project Structure

```
api/
├── dramabox/
│   ├── chapter.js       # Chapter-related functions
│   ├── client.js        # API client helper
│   ├── detail.js        # Detail functions
│   ├── details.js       # Extended detail functions
│   ├── download.js      # Download functions
│   ├── drama.js         # Drama list functions
│   ├── dramaboxHelper.js # Authentication helpers
│   ├── index.js         # Module exports
│   └── search.js        # Search functions
├── server.js            # Express server
├── package.json         # Dependencies
├── .env                # Environment config
└── README.md           # Documentation
```

## 🧪 Testing

### Using cURL

```bash
# Get drama list
curl http://localhost:3000/api/drama/list

# Search drama
curl "http://localhost:3000/api/search?keyword=love"

# Get chapters
curl http://localhost:3000/api/chapter/123

# Batch download (POST)
curl -X POST http://localhost:3000/api/chapter/batch-download \
  -H "Content-Type: application/json" \
  -d '{"bookId":"123","chapterIdList":[1,2,3]}'
```

### Using HTTPie

```bash
# Get drama list
http GET localhost:3000/api/drama/list

# Search drama
http GET localhost:3000/api/search keyword==love

# Batch download
http POST localhost:3000/api/chapter/batch-download \
  bookId=123 chapterIdList:='[1,2,3]'
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will automatically detect the configuration
4. Deploy!

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 📄 License

ISC

## 👤 Author

**lannzephry**

## 👨‍💻 Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buka issue di GitHub repository.
