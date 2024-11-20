# Roadmap

## Version 1.0 - Core MVP (Minimum Viable Product)
### Features
- User registration and onboarding:
  - Email/phone authentication.
  - Calibration process with photo and interest ratings.
- Basic matchmaking:
  - AI-driven compatibility scoring.
  - Daily connection batches with 5 prospects.
  - Messaging unlocked upon mutual interest.
- Location preferences:
  - Free users: One location, changeable once per week.
  - Premium users: Multiple locations with travel badges.
- Notifications:
  - Match availability alerts.
  - Reminder for pending connections (48-hour rule).
- Minimalist and upscale UI/UX:
  - Dark mode default.
  - Modern fonts and vibrant accents.
- Feedback section in settings (optional and non-intrusive).

### Platforms
- iOS App: Focused development for MVP.
- Web Service: Backend APIs and services.

### Infrastructure
- Batch processing for matchmaking.
- Cloud-native architecture with parallel task execution:
  - AWS Lambda, SQS for scalability.
  - Vector databases for AI compatibility scoring.
- Secure user data handling (GDPR/CCPA compliant).

---

## Version 1.1 - Enhanced User Experience
### Features
- Gamified onboarding:
  - Swipe mechanics for photo and interest ratings.
  - Tips like "Rating more accurately improves your matches."
- Dynamic learning:
  - Improve matchmaking using feedback from successful connections (>6 messages exchanged).

---

## Version 1.2 - Premium Tier Introduction
### Features
- Advanced matchmaking filters:
  - Education, niche interests, and more.
- Priority visibility for premium users:
  - Appear more often in others’ match suggestions.
- AI message crafting:
  - Generate personalized opening messages.
- Monthly recalibration for premium users.

---

## Version 1.3 - Places and Activities
### Features
- Personalized recommendations:
  - Bars, clubs, restaurants, art shows, etc.
- Monetization:
  - Paid promotions for businesses in the recommendations list.
- Event-based badges for attendees.

---

## Version 1.4 - Social Engagement
### Features
- Shared spaces:
  - Interest-based chat rooms.
  - Discussion forums for group connections.

---

## Version 2.0 - Android App and Global Scale
### Features
- Android App: Development and launch.
- Multi-language support.
- Cultural matchmaking considerations.
- Advanced AI for non-linear connections.

### Infrastructure
- Full adoption of distributed systems for global reach:
  - Multi-region cloud architecture.
  - Edge computing for low-latency user experiences.

---

## Future Enhancements
- Virtual matchmaking events.
- Collaborative goals (e.g., group travel planning).
- Integration with AR/VR for immersive interactions.
- Identity-based badges (e.g., travel, interests).