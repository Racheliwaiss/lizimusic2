# Like Feature Design

## Overview
The Like feature allows users to mark tracks, artists, and content as favorites. It's a core engagement mechanism that enables users to curate personal collections and helps the platform understand user preferences.

## Component: LikeButton

### Purpose
A reusable, interactive button component that allows users to toggle their "like" status on content items. The button provides visual feedback and can display like counts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLiked` | boolean | `false` | Current like state |
| `count` | number | `0` | Number of likes on the item |
| `variant` | string | `"icon"` | Display variant: `"icon"` (minimal) or `"inline"` (with count) |
| `size` | string | `"medium"` | Button size: `"small"`, `"medium"`, or `"large"` |
| `onClick` | function | - | Callback function when like state toggles |
| `isDarkMode` | boolean | `true` | Theme adaptation |

### Usage Example

```jsx
import { LikeButton } from './components';

export function TrackCard({ track }) {
  const [isLiked, setIsLiked] = useState(track.userLiked);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    // Update backend
    await updateTrackLike(track.id, !isLiked);
  };

  return (
    <div>
      <h3>{track.title}</h3>
      <LikeButton
        isLiked={isLiked}
        count={track.likeCount}
        variant="inline"
        size="medium"
        onClick={handleLike}
      />
    </div>
  );
}
```

## Visual Design

### Icon States

#### Default (Not Liked)
- **Icon**: `favorite_border` (Material Symbols Outlined)
- **Color**: `on-surface-variant` (#c4c7c8)
- **Opacity**: 100%
- **Animation**: Scale 1.0

#### Liked
- **Icon**: `favorite` (Material Symbols Outlined, filled)
- **Color**: `primary` (#ffffff)
- **Opacity**: 100%
- **Animation**: Scale 1.15 (brief pulse on click)

### Interactive Behavior

#### Hover State
- Background opacity increases to 15% (on dark surfaces)
- Color remains consistent with current state
- Cursor changes to pointer

#### Active/Press State
- Scale: 0.95 (slight compress)
- Transition: smooth 100ms ease-out

#### Animations
- **State Change**: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Count Update**: Fade in/out effect (200ms) for count changes
- **Like Pulse**: Brief scale animation (0.9 → 1.15 → 1.0) over 400ms

### Variants

#### Icon Variant (Minimal)
```jsx
<LikeButton
  isLiked={true}
  variant="icon"
  size="small"
  onClick={handleLike}
/>
```
- **Usage**: Compact displays, card headers, inline content
- **Display**: Icon only, no count
- **Padding**: 8px

#### Inline Variant (With Count)
```jsx
<LikeButton
  isLiked={true}
  count={2543}
  variant="inline"
  size="medium"
  onClick={handleLike}
/>
```
- **Usage**: Track details, artist profiles, engagement metrics
- **Display**: Icon + count text
- **Count Format**: Abbreviated (1.2K, 542, etc.)
- **Padding**: 12px 16px

### Sizing

| Size | Icon Size | Font Size | Padding |
|------|-----------|-----------|---------|
| `small` | 16px | 12px (count) | 6px |
| `medium` | 20px | 14px (count) | 8px 12px |
| `large` | 24px | 16px (count) | 12px 16px |

## Color Palette

### Dark Theme (Default)
- **Unlisted State**: `on-surface-variant` (#c4c7c8)
- **Liked State**: `primary` (#ffffff)
- **Background Hover**: `surface-container-high` (#2a2a2a, 15% opacity)
- **Count Text**: `on-surface` (#e5e2e1)

### Light Theme
- **Unlisted State**: `outline` (#8e9192)
- **Liked State**: `primary` (#ffffff) → Consider `error` (#ffb4ab) for more prominent "heart" feel
- **Background Hover**: `surface-container-low` (#1c1b1b, 10% opacity)
- **Count Text**: `on-surface` (adaptive)

## Typography

### Count Display
- **Font Family**: Inter
- **Font Size**: 14px (medium variant)
- **Font Weight**: 500
- **Line Height**: 1.2
- **Color**: `on-surface`
- **Letter Spacing**: 0em

## Spacing & Layout

### Inline Variant Layout
```
[Icon] [Gap: 8px] [Count Text]
```
- Icon to text gap: 8px
- Total component height: 32px (medium)
- Vertical alignment: center

### Container Margin
- **Horizontal**: 8px margins from adjacent elements
- **Vertical**: 4px top/bottom padding

## Interaction Patterns

### Like Flow
1. User clicks LikeButton
2. Button triggers animation (pulse/scale)
3. Icon changes color/fill state
4. Count updates (if visible)
5. `onClick` callback fires
6. Backend updates like status
7. Optional: Toast notification for confirmation

### Accessibility

#### ARIA Attributes
```jsx
<button
  aria-label={`${isLiked ? 'Unlike' : 'Like'} - ${count} likes`}
  aria-pressed={isLiked}
  role="button"
/>
```

#### Keyboard Support
- **Focus**: Visible focus ring (2px, primary color)
- **Interaction**: Enter or Space to toggle
- **Tab Order**: Logical navigation flow

#### Visual Indicators
- High contrast: Icon color vs background (WCAG AA compliant)
- Icon visibility at all sizes
- Clear state indicators (filled vs outlined)

## States & Edge Cases

### Loading State
- Icon grayed out temporarily
- Disabled cursor
- Optional: Loading spinner overlay

### Error State
- Icon returns to previous state
- Error toast/message displayed
- Optional: Retry button

### Optimistic Updates
- Update UI immediately
- Rollback if backend fails
- Show error message

## Platform-Specific Notes

### Mobile Optimization
- **Touch Target**: Minimum 44px × 44px (WCAG standard)
- **Variant**: Icon (compact) or inline with larger padding
- **Animation**: Slightly faster (200ms) for tactile feedback

### Desktop Optimization
- **Hover States**: Full visual feedback
- **Tooltip**: Optional "Like this track" on hover
- **Keyboard**: Full keyboard navigation support

## Best Practices

1. **Immediate Feedback**: Provide visual feedback before backend confirmation
2. **Prevent Spam**: Debounce rapid clicks (300ms minimum)
3. **Consistent Placement**: Keep like buttons in predictable locations
4. **Clear State**: Always indicate current like status
5. **Analytics**: Track like events for personalization
6. **Performance**: Optimize re-renders with React.memo for lists

## Related Components

- **EngagementStats**: Displays total likes, comments, shares, plays
- **AudioPlayer**: Integrates like button during playback
- **TrackCard**: Contains like button in compact view
- **ArtistCard**: Like/follow functionality for artists

## Future Enhancements

- [ ] Animated heart particle effects on like (premium)
- [ ] "Like" to "Love" upgrade with custom animations
- [ ] Social sharing of liked content
- [ ] AI recommendations based on likes
- [ ] Like count trending/history charts
- [ ] Undo option with timer countdown

## References

- **Design System**: See `DESIGN.md`
- **Color Tokens**: `constants/designTokens.js`
- **Component Code**: `components/Engagement.jsx`
- **Material Symbols**: [Material Design Icons](https://fonts.google.com/icons)
