# GRIDLOCK Admin Panel Setup & Access Guide

## ✅ Admin Access Fixed

Your admin access has been configured to work with your email: **codecraftkavya@gmail.com**

### How It Works

The admin system now checks both:
1. **Firebase Custom Claims** (set via Admin SDK) - `role: 'admin'`
2. **Hardcoded Admin Email** - `codecraftkavya@gmail.com`

This means you can access the admin panel immediately by:
1. Signing in with Google using **codecraftkavya@gmail.com**
2. Navigating to `/admin` in the app
3. You should now have full admin access ✅

## Admin Panel Features

### 1. **User Management** (`/admin/users`)
- **View all users** with avatars, usernames, email, and join date
- **Search users** by username
- **Ban/Unban users** - prevent access to the platform
- **Make/Remove Admin** - grant admin privileges to other users
- **Delete users** - permanently remove user accounts from database
- **Pagination** - load more users as needed

### 2. **Content Moderation** (`/admin/moderation`)
- Approve pending reviews
- Approve pending debates
- View content awaiting admin approval

### 3. **Reports** (`/admin/reports`)
- View user-submitted reports
- Mark reports as resolved
- Take action on reported content

### 4. **Debates Management** (`/admin/debates`)
- View all debates
- Approve/reject pending debates
- Delete inappropriate debates

### 5. **Reviews Management** (`/admin/reviews`)
- View all submitted reviews
- Approve reviews before they show publicly
- Delete problematic reviews

### 6. **Analytics** (`/admin/analytics`)
- View platform statistics
- Track active users
- Monitor engagement metrics

### 7. **Announcements** (`/admin/announcements`)
- Post platform-wide announcements
- Schedule announcements
- Target specific user groups

### 8. **Audit Log** (`/admin/audit-log`)
- View all admin actions
- Track who did what and when
- Review platform changes

## How to Add More Admins

### Option 1: Via Admin Panel (Recommended)
1. Go to `/admin/users`
2. Search for the user you want to make admin
3. Click "Make Admin" button
4. They'll need to manually set Firebase custom claims too

### Option 2: Via Firebase Admin SDK (Permanent)
Run this command to set permanent admin claims:

```bash
node scripts/set-admin.js <USER_UID>
```

Example:
```bash
node scripts/set-admin.js "abc123xyz789"
```

You need:
- The user's Firebase UID (found in `/admin/users`)
- Firebase Admin SDK credentials (serviceAccountKey.json)

## Firestore Rules for Admin

Admins can:
- Read/write all content collections
- Bypass approval requirements
- Manage other users
- Delete any content
- View audit logs

Non-admins can:
- Only see approved content
- Create unapproved content (pending admin review)
- Only edit/delete their own content

## User Deletion

When you delete a user via admin panel:
1. Their Firestore document is removed
2. All their data associations are lost
3. They can sign up again with same email
4. Action is logged in audit trail

⚠️ **Warning**: This is permanent and affects:
- User profile
- Review history
- Debate posts
- Collections
- Shelf data

## Troubleshooting

### "Access denied. Administrator privileges required"
- ✅ Now fixed! Sign in with codecraftkavya@gmail.com
- Ensure you're using Google Sign-In
- Check your email is correct in Auth settings

### Can't see changes in admin panel
- Try refreshing the page
- Check your Firebase Firestore rules
- Ensure you're signed in as admin

### Users not appearing in admin panel
- Check Firestore "users" collection exists
- Verify Firestore rules allow admin read access
- Check user documents have required fields (uid, username, joinedAt)

## Next Steps

1. **Sign in** with codecraftkavya@gmail.com
2. **Visit** `/admin` 
3. **Click** "GRIDLOCK Admin Panel" in navbar (if showing)
4. **Explore** each admin section
5. **Manage** users, content, and platform settings

---

**Last Updated**: 2026-04-22
**Version**: 1.0
