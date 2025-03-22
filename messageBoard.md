# Ephemeral Message Board Implementation Checklist

This checklist outlines the steps needed to implement a message board with 280-character limit messages that expire after 24 hours or when a user has posted 5 messages.

## Firebase Database Setup

-   [x] Create Firestore collections:
    -   [x] `messages` collection with fields:
        -   [x] `userId` - String (user identifier)
        -   [x] `username` - String (display name)
        -   [x] `content` - String (max 280 chars)
        -   [x] `timestamp` - Timestamp (creation time)
        -   [x] `expiresAt` - Timestamp (24 hours after creation)
        -   [ ] `reactionCount` - Number (optional feature)
    -   [ ] `userMessageCounts` collection with fields:
        -   [ ] `userId` - String (user identifier)
        -   [ ] `messageCount` - Number (active posts count)
        -   [ ] `oldestMessageId` - String (for deletion when limit reached)

## Firebase Security Rules

-   [ ] Set up Firestore security rules for messages: match /userMessageCounts/{userId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        }

## Firebase Cloud Functions

-   [ ] Create a scheduled function for deleting expired messages:
-   [ ] Create `functions/src/messages.js` file
-   [ ] Implement `cleanupExpiredMessages` function that runs hourly
-   [ ] Test message cleanup function locally

-   [ ] Create an onDelete trigger function for user message counts:
-   [ ] Implement `onMessageDelete` to decrement user's message count
-   [ ] Handle edge cases (message deletion, user deletion)

## Frontend Components

-   [x] `MessageBoard.jsx` - Fetch messages from Firebase
-   [x] `MessageInput.jsx` - Submit messages to Firebase

-   [ ] Create basic message components:
-   [ ] `MessageBoard.jsx` - Container component
-   [ ] `MessageInput.jsx` - Form with character counter
-   [ ] `MessageList.jsx` - Displays messages with infinite scroll
-   [ ] `MessageItem.jsx` - Individual message display

-   [ ] Enhance message components with features:
-   [ ] Add character counter (0/280)
-   [ ] Show expiration time remaining
-   [ ] Add user message quota indicator (X/5 messages used)
-   [ ] Implement message deletion option

## Message Operations in Frontend

-   [ ] Implement message creation flow:
-   [ ] Validate message length client-side
-   [ ] Check if user already has 5 messages
-   [ ] Create transaction to delete oldest message if at limit
-   [ ] Set 24-hour expiry timestamp
-   [ ] Update user's message count

-   [ ] Implement message deletion flow:
-   [ ] Allow users to delete their own messages
-   [ ] Update message count when deletion occurs

-   [ ] Implement real-time updates:
-   [ ] Set up Firestore listeners for new messages
-   [ ] Handle message deletions in the UI

## UI/UX Elements

-   [ ] Add the Message Board to layout:

    -   [ ] Create a new route `/chat` or `/discussion` in the routing configuration file.
    -   [ ] Add a navigation link in the sidebar or navbar pointing to the new route.
    -   [ ] Ensure the route renders the `MessageBoard` component.

-   [ ] Style message components:
    -   [ ] Use the existing design system or CSS framework for consistent styling.
    -   [ ] Create a reusable `MessageCard` component for individual messages.
    -   [ ] Add responsive styles to ensure the message board works on mobile devices.
    -   [ ] Implement loading states for message fetching and transitions for smooth UI updates.

## Testing

-   [ ] Test message creation:
-   [ ] Verify character limit enforcement
-   [ ] Ensure message count is updated
-   [ ] Confirm oldest message deletion when limit reached

-   [ ] Test message expiration:
-   [ ] Verify messages expire after 24 hours
-   [ ] Confirm user counts update correctly

-   [ ] Test security rules:
-   [ ] Ensure users can only delete their own messages
-   [ ] Verify the 5 message limit is enforced

## Deployment

-   [ ] Deploy Firebase functions:
-   [ ] Deploy scheduled message cleanup function
-   [ ] Deploy onDelete trigger function

-   [ ] Update client application:
-   [ ] Test in production environment
-   [ ] Monitor for any errors or performance issues

## Optional Enhancements

-   [ ] Add message reactions (likes, etc.)
-   [ ] Implement message threading/replies
-   [ ] Add admin moderation capabilities
-   [ ] Create email notifications for important messages
-   [ ] Implement @mentions to notify specific users
