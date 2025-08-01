const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');



const app = express();


const allowedOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));


app.options('*', cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/organ_donation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));



// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));      

app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
//Donar and Recipients
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/recipients', require('./routes/recipientRoutes'));
//Finding Donor within 300km
app.use('/api/find-donors', require('./routes/findDonorRoutes'));

app.use('/api/integration', require('./routes/integrationRoutes'));
console.log('🔔 Registering blood-inventory routes');
app.use('/api/blood-inventory', require('./routes/bloodInventoryRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));



const authRoutes = require('./routes/authRoutes');
app.use('/api/organisation', authRoutes);

//Root route
app.get('/', (req, res) => {
  res.send("🩺 Organ Donation Backend is running!");
});

// ✅ Start server with socket.io
const PORT = process.env.PORT || 10000;
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  socket.on('bloodRequest', (data) => {
    console.log('📨 Blood request sent via socket:', data);
    io.emit('newBloodRequest', data);
  });
});

server.listen(PORT, () => {
  // console.log(`🚀 Server with socket.io running at http://localhost:${PORT}`);
  console.log(`🚀 Server with socket.io running on port ${PORT}`);
});

