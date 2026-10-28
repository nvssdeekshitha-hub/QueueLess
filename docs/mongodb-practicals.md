# MongoDB Curriculum Practical Guide

This guide connects the **QueueLess** implementation to core database concepts taught in university B.Tech computer science curricula.

---

## 1. Creating and Dropping Databases & Collections

### Concepts
- **Database Creation:** In MongoDB, databases and collections are created automatically when documents are first inserted.
- **Dropping Database:** `db.dropDatabase()` permanently removes the current database.
- **Dropping Collection:** `db.collection.drop()` removes a collection and all associated indexes.

### Implementation in QueueLess
A dedicated lab script demonstrates this safely in development environments:
- File: [dropDevDb.js](file:///c:/Users/abhin/Desktop/queueless/server/scripts/dropDevDb.js)
```javascript
// Safely dropping development database using Mongoose
await mongoose.connection.db.dropDatabase();
```
*Note: In production, dropping databases is strictly disabled.*

---

## 2. CRUD Operations (Create, Read, Update, Delete)

### 2.1 CREATE (Document Insertion)
#### University Concept: `db.collection.insertOne()`, `db.collection.insertMany()`
#### Modern Mongoose Implementation:
```javascript
// Creating a user with automatic pre-save password hashing
const user = await User.create({
  name: "Deekshitha NVSS",
  email: "student@queueless.edu",
  password: "PlainPassword123!", // Hashed automatically by pre('save') hook
  role: "student",
  studentId: "22CSE1042"
});

// Creating an appointment record
const appointment = await Appointment.create({
  bookingReference: "QL-20261028-7A4B",
  user: user._id,
  service: service._id,
  appointmentDate: "2026-10-29",
  timeSlot: "10:00 - 10:30",
  tokenNumber: "REC-001",
  tokenSequence: 1,
  status: "booked"
});
```

---

### 2.2 READ (Querying & Projections)
#### University Concept: `find()`, `findOne()`, query operators `$in`, `$ne`, `$regex`
#### Modern Mongoose Implementation:
```javascript
// Find service with regex search and category filtering
const services = await Service.find({
  isActive: true,
  category: "Academic",
  name: { $regex: "records", $options: "i" }
}).sort({ name: 1 });

// Find single document by ObjectId and populate references
const appointment = await Appointment.findById(appointmentId)
  .populate("service", "name code counterName")
  .populate("user", "name email studentId");

// Find highest sequence number issued today for a service
const lastAppointment = await Appointment.findOne({
  service: serviceId,
  appointmentDate: "2026-10-29"
}).sort({ tokenSequence: -1 }).select("tokenSequence");
```

---

### 2.3 UPDATE (Document Modification)
#### University Concept: `updateOne()`, `findOneAndUpdate()`, operators `$set`
#### Modern Mongoose Implementation:
```javascript
// Atomic update with validation
const updatedService = await Service.findByIdAndUpdate(
  serviceId,
  { $set: { slotCapacity: 6, estimatedDurationMin: 12 } },
  { new: true, runValidators: true }
);

// State-safe appointment progression
appointment.status = "serving";
appointment.servingStartedAt = new Date();
appointment.servedBy = staffUserId;
await appointment.save(); // Triggers Mongoose document middleware
```

---

### 2.4 DELETE (Document Removal & Soft-Deletion)
#### University Concept: `deleteOne()`, `deleteMany()`
#### Modern Mongoose Implementation:
```javascript
// Hard deletion (Admin appointment purge)
await Appointment.findByIdAndDelete(appointmentId);

// Soft deletion (Retains audit history for operational reporting)
service.isActive = false;
await service.save();
```

---

## 3. Query Modifiers: Sorting, Limiting, and Pagination

```javascript
// Pagination implementation using skip() and limit()
const pageNum = 1;
const limitNum = 10;
const skip = (pageNum - 1) * limitNum;

const appointments = await Appointment.find({ service: serviceId })
  .sort({ appointmentDate: -1, tokenSequence: -1 })
  .skip(skip)
  .limit(limitNum);
```

---

## 4. Indexing Strategy

Indexes significantly reduce document scan times from $O(N)$ (collection scan) to $O(\log N)$ (index scan).

### Single-Field Index:
```javascript
userSchema.index({ email: 1 }, { unique: true });
```

### Compound Unique Index (Concurrency Protection):
Ensures that two tokens cannot have the same sequence number within the same service on the same date:
```javascript
appointmentSchema.index(
  { service: 1, appointmentDate: 1, tokenSequence: 1 },
  { unique: true }
);
```

---

## 5. MongoDB Aggregation Pipeline

Located in [adminController.js](file:///c:/Users/abhin/Desktop/queueless/server/src/controllers/adminController.js):

### 5.1 Daily Bookings & Completion Trend
```javascript
const dailyTrend = await Appointment.aggregate([
  // 1. Group records by appointment date
  {
    $group: {
      _id: "$appointmentDate",
      total: { $sum: 1 },
      completed: {
        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
      },
      cancelled: {
        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
      }
    }
  },
  // 2. Sort chronologically
  { $sort: { _id: 1 } },
  { $limit: 14 },
  // 3. Project clean field names
  {
    $project: {
      date: "$_id",
      total: 1,
      completed: 1,
      cancelled: 1,
      _id: 0
    }
  }
]);
```

### 5.2 Join via `$lookup` for Service Distribution
```javascript
const serviceDistribution = await Appointment.aggregate([
  {
    $group: {
      _id: "$service",
      totalBookings: { $sum: 1 }
    }
  },
  // Join with services collection
  {
    $lookup: {
      from: "services",
      localField: "_id",
      foreignField: "_id",
      as: "serviceDetails"
    }
  },
  { $unwind: "$serviceDetails" },
  {
    $project: {
      name: "$serviceDetails.name",
      code: "$serviceDetails.code",
      totalBookings: 1,
      _id: 0
    }
  }
]);
```
