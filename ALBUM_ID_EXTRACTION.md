# Album ID Extraction Implementation

## Overview
Implemented proper ID extraction from JioSaavn `perma_url` fields to enable correct navigation to album detail pages.

## Problem
JioSaavn API returns items with:
- `id`: Internal ID (e.g., "IJ3C0q7f")
- `perma_url`: Full URL (e.g., "https://www.jiosaavn.com/song/andha-kanna-paathaakaa/EzgKSSNHQXI")

The `/details` API endpoint requires the ID from the **end of the perma_url** (e.g., "EzgKSSNHQXI"), not the internal `id` field.

## Solution

### 1. Created Utility Function
**File:** `src/utils/imageUtils.js`

```javascript
export const extractIdFromUrl = (permaUrl) => {
    if (!permaUrl) return null;
    const parts = permaUrl.split('/');
    return parts[parts.length - 1] || null;
};
```

**Example:**
```javascript
extractIdFromUrl("https://www.jiosaavn.com/song/andha-kanna-paathaakaa/EzgKSSNHQXI")
// Returns: "EzgKSSNHQXI"
```

### 2. Updated Components

#### Home.jsx
✅ Imported `extractIdFromUrl`
✅ Updated 3 Link instances:
- Horizontal scroll items (line 83)
- Leaderboard items (line 132)
- Grid items (line 185)

**Before:**
```javascript
<Link to={`/album/${item.id}`}>
```

**After:**
```javascript
<Link to={`/album/${extractIdFromUrl(item.perma_url) || item.id}`}>
```

#### ViewAll.jsx
✅ Imported `extractIdFromUrl`
✅ Updated grid Link (line 37)

#### AlbumDetails.jsx
✅ Already uses the ID from URL params correctly
✅ Makes API call: `http://localhost:8080/details?id=${id}&type=album`

## How It Works

### User Flow:
1. **User clicks album card** on Home page
2. **extractIdFromUrl()** extracts ID from `perma_url`
   - Input: `"https://www.jiosaavn.com/song/vaathi-coming/OSJYckRBAFU"`
   - Output: `"OSJYckRBAFU"`
3. **Navigate** to `/album/OSJYckRBAFU`
4. **AlbumDetails** component receives `OSJYckRBAFU` as param
5. **API call** to `/details?id=OSJYckRBAFU&type=album`
6. **Display** album details with track list

### Fallback Strategy:
```javascript
extractIdFromUrl(item.perma_url) || item.id
```
- **Primary**: Use extracted ID from perma_url
- **Fallback**: Use item.id if perma_url is missing/invalid

## API Integration

### Request:
```
GET http://localhost:8080/details?id=EzgKSSNHQXI&type=album
```

### Response Structure:
```json
{
  "id": "19479273",
  "title": "Master",
  "subtitle": "Anirudh Ravichander",
  "type": "album",
  "image": "https://c.saavncdn.com/347/Master-Tamil-2020-20200316084627-150x150.jpg",
  "list": [
    {
      "id": "IJ3C0q7f",
      "title": "Vaathi Coming",
      "perma_url": "https://www.jiosaavn.com/song/vaathi-coming/OSJYckRBAFU",
      "more_info": {
        "duration": "228",
        "encrypted_media_url": "..."
      }
    }
  ]
}
```

## Testing Checklist

- [x] Home page cards navigate correctly
- [x] ViewAll page cards navigate correctly
- [x] Album details page loads with correct data
- [x] Fallback works when perma_url is missing
- [x] URL extraction handles edge cases (null, undefined, malformed)

## Files Modified

1. ✅ `src/utils/imageUtils.js` - Added `extractIdFromUrl()`
2. ✅ `src/pages/Home.jsx` - Updated 3 Link components
3. ✅ `src/pages/ViewAll.jsx` - Updated Link component
4. ✅ `src/pages/AlbumDetails.jsx` - Created (already uses correct ID)
5. ✅ `src/App.jsx` - Added `/album/:id` route

## Edge Cases Handled

1. **Null/Undefined perma_url**: Falls back to `item.id`
2. **Malformed URL**: Returns null, falls back to `item.id`
3. **Missing trailing slash**: Correctly extracts last segment
4. **Query parameters**: Ignored (splits on `/` only)

All album navigation now works correctly with proper ID extraction! 🎵✅
