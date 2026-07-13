# Remarks Attachment Feature Implementation

## Overview
Added a mandatory "Remarks" field with file upload capability to the "Log Incident" modal **for barangay users only**. Admins do not see this field and it is not required for them. Barangay users can drag & drop or browse to upload image files (PNG, JPG, JPEG) up to 15MB.

---

## User Role Behavior

### Barangay Users
- **Remarks field is VISIBLE and MANDATORY**
- Must upload an attachment to proceed
- Can drag & drop or click to browse
- File validation: PNG, JPG, JPEG only, max 15MB

### Admin Users
- **Remarks field is HIDDEN**
- No attachment required
- Can log incidents without any file upload
- Field is completely removed from the form

---

## Changes Made

### 1. Database Migration
**File:** `likas-backend/src/db/migrate_add_remarks_attachment.sql`
- Added `remarks_attachment` VARCHAR(500) column to `flood_incidents` table
- Migration executed successfully ✅

### 2. Backend Changes

#### a. Package Installation
- Installed `multer` for handling multipart/form-data file uploads

#### b. File Upload Configuration
**File:** `likas-backend/src/routes/flood.js`
- Configured multer storage to save files to `uploads/flood-attachments/`
- Set file size limit: 15MB
- Allowed file types: PNG, JPG, JPEG only
- Generates unique filenames: `timestamp-randomnumber-originalname`

#### c. API Route Updates
**File:** `likas-backend/src/routes/flood.js`
- **POST /:barangayId** - Updated to accept `multipart/form-data` with `remarksAttachment` field
  - Saves uploaded file to disk
  - Stores file path in database as `/uploads/flood-attachments/filename`
- **GET /** - Updated query to include `remarks_attachment` field
- **GET /:barangayId** - Updated query to include `remarks_attachment` field

#### d. Static File Serving
**File:** `likas-backend/src/index.js`
- Added express static middleware to serve files from `/uploads` directory
- Allows frontend to access uploaded attachments via URL

### 3. Frontend Changes

#### a. TypeScript Types
**File:** `likas-frontend/src/types/index.ts`
- Added `remarksAttachment?: string` to `FloodIncident` interface

#### b. Service Layer
**File:** `likas-frontend/src/services/index.ts`
- Updated `createFloodIncident()` to accept optional `remarksFile?: File` parameter
- Changed from JSON payload to FormData for file upload support
- Includes all incident fields + file as multipart/form-data

#### c. UI Component
**File:** `likas-frontend/src/components/modals/LogIncidentModal.tsx`

**Added State:**
- `remarksFile` - Stores the selected File object
- `isAdmin` - Derived from `useAuth()` to check user role
- Added validation to require remarks file only for barangay users

**File Dropzone Features:**
- **Conditional rendering** - Only shown to barangay users (hidden for admins)
- Drag & drop support with visual feedback
- Click to browse file picker
- File type validation (PNG, JPG, JPEG)
- File size validation (max 15MB)
- Preview of selected file with name and size
- Remove button to clear selection
- Error messages for invalid files

**Form Step Updates:**
- Added "Remarks" field with mandatory indicator (*) - **barangay users only**
- Positioned after "Cause" field as per requirements
- Validation requires file before proceeding - **barangay users only**
- Admins skip this field entirely

**Overview Step Updates:**
- Shows selected attachment file name with icon - **barangay users only**
- Displays in review before submission
- Hidden for admin users

---

## UI Design

The Remarks dropzone matches the design specification:

```
[ CAUSE ]
┌────────────────────────────────────────────────────────┐
│ Type or select a cause                               ▾ │
└────────────────────────────────────────────────────────┘

[ REMARKS * ]
┌────────────────────────────────────────────────────────┐
│ 📁 Drag & drop an image here, or browse               │
│    Supports: PNG, JPG, JPEG (Max 15MB)                │
└────────────────────────────────────────────────────────┘
```

**Visual States:**
- Empty: Gray dashed border with upload icon
- Hover: Blue border with blue background
- File selected: Green border with checkmark icon
- Shows file name and size when uploaded
- "Remove" button to clear selection

---

## Validation Rules

1. **Role-Based Field Display**
   - **Barangay users**: Field is visible and mandatory
   - **Admin users**: Field is hidden and not required

2. **For Barangay Users:**
   - **Mandatory Field** - Cannot proceed without uploading a file
   - **File Types** - Only PNG, JPG, JPEG accepted (validated on both client and server)
   - **File Size** - Maximum 15MB (validated on both client and server)
   - **Error Handling** - Clear error messages for validation failures

3. **For Admin Users:**
   - No file upload required
   - Field is completely hidden from the form
   - Can proceed with incident logging without attachment

---

## Testing Checklist

- [x] Database migration executed successfully
- [x] Backend accepts multipart/form-data
- [x] File upload saves to correct directory
- [x] File path stored in database
- [x] Frontend form validates file presence
- [x] Drag & drop functionality works
- [x] File type validation works
- [x] File size validation works
- [x] File preview shows correct information
- [x] Remove button clears selection
- [x] Overview step displays attachment
- [x] No TypeScript errors
- [x] No backend errors

---

## API Changes

### Request Format Change
**Before:** `application/json`
```json
{
  "date": "2025-01-15",
  "time": "14:30",
  "street": "Taft Avenue",
  "depthInches": 12,
  "status": "NPLV",
  "cause": "Heavy Rainfall",
  "priority": "Medium"
}
```

**After:** `multipart/form-data`
```
FormData:
  - date: "2025-01-15"
  - time: "14:30"
  - street: "Taft Avenue"
  - depthInches: "12"
  - status: "NPLV"
  - cause: "Heavy Rainfall"
  - priority: "Medium"
  - remarksAttachment: [File]
```

### Response Format
```json
{
  "id": "fi-1736956800000",
  "barangayId": "brgy-001",
  "date": "2025-01-15",
  "time": "14:30",
  "street": "Taft Avenue",
  "depthInches": 12,
  "status": "NPLV",
  "cause": "Heavy Rainfall",
  "priority": "Medium",
  "remarksAttachment": "/uploads/flood-attachments/1736956800000-123456789-photo.jpg",
  ...
}
```

---

## File Storage

**Directory:** `likas-backend/uploads/flood-attachments/`
**Filename Pattern:** `{timestamp}-{random}-{originalname}`
**Access URL:** `http://localhost:5000/uploads/flood-attachments/{filename}`

---

## Notes

- File uploads are **mandatory ONLY for barangay users** logging incidents
- **Admin users do not see the remarks field** and can log incidents without attachments
- Files are stored on the server filesystem (not in database)
- Database stores only the file path/URL (can be NULL for admin-created incidents)
- Uploaded files persist on server and can be accessed via static URL
- Admin users can view the attachment URLs when reviewing barangay-submitted incidents
- The `remarksAttachment` field in the database is nullable to support admin submissions
