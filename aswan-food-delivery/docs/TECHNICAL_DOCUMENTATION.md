# 📋 التوثيق الفني - أسوان فود
# Technical Documentation - Aswan Food

## 🏗️ معمارية النظام (System Architecture)

### Overview
أسوان فود هو تطبيق ويب متكامل لتوصيل الطعام مصمم خصيصاً لمحافظة أسوان. يتبع التطبيق معمارية **Client-Server** مع **Real-time Communication**.

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express.js API │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.IO     │    │      Redis      │    │   Cloudinary    │
│  (Real-time)    │    │     (Cache)     │    │ (File Storage)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ التقنيات المستخدمة (Tech Stack)

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x
- **ORM**: Prisma 5.x
- **Cache**: Redis 7.x
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO 4.x
- **File Upload**: Multer + Cloudinary
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit
- **Routing**: React Router 6.x
- **Styling**: Tailwind CSS 3.x
- **Forms**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Process Manager**: PM2 (for production)
- **CI/CD**: GitHub Actions (ready)
- **Monitoring**: Winston Logger

## 📊 قاعدة البيانات (Database Schema)

### Core Tables

#### Users
```sql
- id (UUID, Primary Key)
- email (Unique)
- phone (Unique, Optional)
- password (Hashed)
- firstName, lastName
- role (CUSTOMER, RESTAURANT_OWNER, DELIVERY_DRIVER, ADMIN)
- avatar (URL)
- isActive, isVerified
- timestamps
```

#### Restaurants
```sql
- id (UUID, Primary Key)
- ownerId (Foreign Key → Users)
- name, nameAr (Arabic name)
- description, descriptionAr
- address, latitude, longitude
- phone, email
- deliveryTime, deliveryFee, minimumOrder
- rating, totalReviews
- openingTime, closingTime
- isActive, isOpen
- timestamps
```

#### MenuItems
```sql
- id (UUID, Primary Key)
- restaurantId (Foreign Key → Restaurants)
- categoryId (Foreign Key → Categories)
- name, nameAr
- description, descriptionAr
- price, discountPrice
- image (URL)
- isAvailable, isPopular
- ingredients, allergens, calories
- preparationTime
- timestamps
```

#### Orders
```sql
- id (UUID, Primary Key)
- customerId (Foreign Key → Users)
- restaurantId (Foreign Key → Restaurants)
- driverId (Foreign Key → Users, Optional)
- addressId (Foreign Key → Addresses)
- orderNumber (Unique)
- status (Enum)
- subtotal, deliveryFee, tax, discount, total
- paymentMethod, paymentStatus
- notes, estimatedDeliveryTime
- timestamps for each status change
```

### Relationships
- **One-to-Many**: User → Orders, Restaurant → Orders, Restaurant → MenuItems
- **Many-to-Many**: Orders ↔ MenuItems (through OrderItems)
- **One-to-One**: Order → Review (optional)

## 🔐 نظام المصادقة (Authentication System)

### JWT Implementation
```typescript
// Token Structure
{
  id: string,           // User ID
  email: string,        // User email
  role: UserRole,       // User role
  firstName: string,    // User first name
  lastName: string,     // User last name
  iat: number,          // Issued at
  exp: number,          // Expires at
  iss: 'aswan-food',    // Issuer
  aud: 'aswan-food-users' // Audience
}
```

### Role-Based Access Control (RBAC)
- **CUSTOMER**: Can place orders, view own orders, manage profile
- **RESTAURANT_OWNER**: Can manage restaurant, menu, view restaurant orders
- **DELIVERY_DRIVER**: Can view assigned orders, update delivery status
- **ADMIN**: Full access to all resources and analytics

### Security Features
- Password hashing with bcrypt (12 rounds)
- JWT with expiration and refresh tokens
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet security headers

## ⚡ Real-time Features

### Socket.IO Events

#### Order Tracking
```typescript
// Client → Server
'location_update' // Driver location updates
'order_status_update' // Status changes
'driver_availability' // Driver availability

// Server → Client
'order_update' // Order status changes
'driver_location' // Real-time driver location
'new_order' // New orders for restaurants
'notification' // System notifications
```

#### Chat System
```typescript
// Order-based messaging between customer, restaurant, and driver
'send_message' // Send message
'new_message' // Receive message
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
```
POST   /register         - Register new user
POST   /login            - User login
GET    /me               - Get current user
POST   /refresh          - Refresh JWT token
POST   /logout           - User logout
POST   /forgot-password  - Request password reset
POST   /reset-password   - Reset password
POST   /verify-email     - Verify email address
```

### Restaurants (`/api/restaurants`)
```
GET    /                 - Get all restaurants (with filtering)
GET    /:id              - Get restaurant by ID
GET    /:id/menu         - Get restaurant menu
GET    /:id/reviews      - Get restaurant reviews
GET    /search/:query    - Search restaurants
```

### Orders (`/api/orders`)
```
POST   /                 - Create new order
POST   /calculate        - Calculate order total
GET    /:id              - Get order by ID
PUT    /:id/status       - Update order status
PUT    /:id/cancel       - Cancel order
```

### Users (`/api/users`)
```
GET    /profile          - Get user profile
PUT    /profile          - Update user profile
PUT    /password         - Change password
GET    /addresses        - Get user addresses
POST   /addresses        - Add new address
PUT    /addresses/:id    - Update address
DELETE /addresses/:id    - Delete address
GET    /orders           - Get user orders
```

### Admin (`/api/admin`)
```
GET    /analytics        - Get system analytics
GET    /users            - Get all users
PUT    /users/:id/status - Update user status
GET    /restaurants      - Get all restaurants
PUT    /restaurants/:id/status - Update restaurant status
GET    /orders           - Get all orders
GET    /settings         - Get system settings
PUT    /settings/:key    - Update system setting
```

## 🎨 Frontend Architecture

### State Management (Redux)
```typescript
// Store Structure
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  restaurants: {
    restaurants: Restaurant[],
    currentRestaurant: Restaurant | null,
    filters: RestaurantFilters,
    pagination: PaginationInfo,
    isLoading: boolean
  },
  cart: {
    cart: Cart,
    isLoading: boolean,
    error: string | null
  },
  orders: {
    orders: Order[],
    currentOrder: Order | null,
    isLoading: boolean
  },
  ui: {
    theme: 'light' | 'dark',
    language: 'ar' | 'en',
    sidebarOpen: boolean,
    notifications: Notification[]
  }
}
```

### Component Structure
```
src/
├── components/
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── ui/              # Reusable UI components
│   └── forms/           # Form components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API services
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Internationalization (i18n)
- **Arabic (RTL)**: Primary language for Aswan users
- **English (LTR)**: Secondary language
- Dynamic language switching
- RTL/LTR layout support
- Localized date/time formatting

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach
- Progressive enhancement from mobile to desktop
- Touch-friendly interface
- Optimized for Arabic text rendering
- Gesture support for cart and navigation

## 🔄 Data Flow

### Order Creation Flow
```
1. User adds items to cart (Redux state)
2. User proceeds to checkout
3. Frontend calculates order total (API call)
4. User confirms order details
5. Order created in database
6. Real-time notification sent to restaurant
7. Order status updates via Socket.IO
8. User receives order confirmation
```

### Real-time Updates Flow
```
1. Order status changes (restaurant/driver action)
2. Backend updates database
3. Socket.IO broadcasts update
4. Frontend receives update via socket
5. Redux state updated
6. UI automatically re-renders
7. User notification displayed
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints with database
- **E2E Tests**: Complete user workflows
- **Load Tests**: Performance under load

### Frontend Testing
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: Redux store interactions
- **E2E Tests**: User journeys with Cypress
- **Visual Tests**: Component snapshots

## 🚀 Deployment Options

### Development
```bash
# Option 1: Local development
npm run dev

# Option 2: Docker development
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
# Option 1: Docker production
docker-compose up -d

# Option 2: Cloud deployment (AWS/DigitalOcean)
# CI/CD with GitHub Actions
```

### Environment Variables
```bash
# Server
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_...
CLOUDINARY_URL=cloudinary://...

# Client
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your-key
```

## 📈 Performance Optimizations

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for session storage and frequent queries
- **Pagination**: All list endpoints support pagination
- **Connection Pooling**: PostgreSQL connection pooling
- **Compression**: Gzip compression for responses

### Frontend
- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: WebP format with fallbacks
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker for offline support
- **Virtual Scrolling**: For large lists

## 🔍 Monitoring & Logging

### Backend Logging
```typescript
// Winston logger with different levels
logger.error('Error message', { error, context });
logger.warn('Warning message', { context });
logger.info('Info message', { context });
logger.debug('Debug message', { context });
```

### Frontend Error Tracking
```typescript
// Error boundaries for React components
// Console logging in development
// Error reporting service integration ready
```

## 🔒 Security Considerations

### Data Protection
- **Encryption**: Passwords hashed with bcrypt
- **Validation**: Input validation on both client and server
- **Sanitization**: XSS protection with proper escaping
- **Rate Limiting**: API rate limiting to prevent abuse

### API Security
- **HTTPS**: SSL/TLS encryption (production)
- **CORS**: Configured for specific origins
- **Headers**: Security headers with Helmet
- **Token Expiry**: JWT tokens with reasonable expiry times

## 📊 Analytics & Reporting

### Admin Dashboard Metrics
- Total users, restaurants, orders
- Revenue analytics by day/month
- Top performing restaurants
- Order status distribution
- User activity patterns

### Restaurant Analytics
- Order volume and revenue
- Popular menu items
- Customer ratings and reviews
- Peak hours analysis

## 🔄 CI/CD Pipeline (Ready for Implementation)

```yaml
# GitHub Actions workflow
name: Deploy Aswan Food

on:
  push:
    branches: [main]

jobs:
  test:
    - Run backend tests
    - Run frontend tests
    - Check code quality
    
  build:
    - Build Docker images
    - Push to registry
    
  deploy:
    - Deploy to staging
    - Run integration tests
    - Deploy to production
```

## 🎯 Future Enhancements

### Phase 2 Features
- **Mobile App**: React Native application
- **AI Recommendations**: Personalized food suggestions
- **Advanced Analytics**: Business intelligence dashboard
- **Multi-language**: Additional language support
- **Voice Orders**: Voice-to-text ordering
- **Loyalty Program**: Points and rewards system

### Scalability Improvements
- **Microservices**: Split into smaller services
- **Load Balancing**: Multiple server instances
- **CDN**: Content delivery network for static assets
- **Database Sharding**: Horizontal database scaling
- **Message Queue**: Background job processing

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
docker ps | grep postgres

# View PostgreSQL logs
docker logs aswan-postgres

# Connect to database
docker exec -it aswan-postgres psql -U aswan_user -d aswan_food_db
```

#### Redis Connection
```bash
# Check Redis status
docker ps | grep redis

# Connect to Redis
docker exec -it aswan-redis redis-cli

# Test connection
redis-cli ping
```

#### Socket.IO Issues
```bash
# Check server logs
npm run server

# Test socket connection in browser console
io.connect('http://localhost:5000')
```

## 📞 Support & Maintenance

### Development Team Contacts
- **Lead Developer**: [Your Name]
- **Backend Developer**: [Your Name]
- **Frontend Developer**: [Your Name]
- **DevOps Engineer**: [Your Name]

### Documentation Updates
This documentation should be updated with each major release or architectural change.

### Code Reviews
All code changes should go through peer review process before merging to main branch.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Environment**: Development  

> "Built with ❤️ for the people of Aswan"