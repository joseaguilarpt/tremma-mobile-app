# Tremma - Delivery Driver App

**Smart delivery management with integrated routes, payments, and real-time communication**

Tremma is a mobile application built with React Native and Expo, designed to optimize the daily workflow of delivery drivers. It leverages React Navigation for seamless navigation and React Native Paper for a polished, accessible user interface.

![Tremma Demo](https://via.placeholder.com/300x600/008080/FFFFFF?text=Tremma+Demo)

## Key Features 🚚

- **Smart Route Sheets**  
  - Daily overview of assigned deliveries with priorities  
  - Automatic route optimization using geolocation
- **Order Management**  
  - Full order details (customer, products, special instructions)  
  - QR code scanning for delivery confirmation
- **Integrated Payment System**  
  - Support for cash, cards, and digital platforms  
  - Automatic receipt generation
- **Returns & Issue Reporting**  
  - Guided forms for incident reporting  
  - Integrated photo capture for documentation
- **Real-Time Communication**  
  - In-app chat with dispatch and customers  
  - Push notifications for critical updates

## Tech Stack

| Technology        | Purpose                         |
|-------------------|---------------------------------|
| Expo              | Cross-platform development      |
| React Navigation  | Screen navigation               |
| React Native Paper| UI/UX components                |
| Firebase          | Push notifications & backend    |

## System Requirements

- Node.js 18+
- Expo CLI installed globally
- Android Studio/Xcode for emulators

## Installation ⚙️

1. Clone the repository:
git clone https://github.com/yourusername/tremma-drivers.git
cd tremma-drivers

text

2. Install dependencies:
npx expo install
npm install @react-navigation/native react-native-paper

text

3. Set up environment variables:
API_KEY=your_api_key
MAPS_PROVIDER=google
NOTIFICATIONS_KEY=firebase_key

text

## Running the App ▶️

npx expo start

text

Press `a` for Android or `i` for iOS in the Expo menu.

## Navigation and UI Setup

The main `App.js` file integrates React Navigation and React Native Paper:

import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

export default function App() {
return (
<PaperProvider>
<NavigationContainer>
<MainStack />
</NavigationContainer>
</PaperProvider>
);
}

text

## Expo Deployment 🚀

1. Build for production:
expo prebuild
expo build:android # or expo build:ios

text

2. Publish OTA updates:
expo publish

text

## Support & Contact 📧

Questions or suggestions?  
**Tremma Team:** support@tremma.com  
**Hours:** Mon-Fri 8:00–18:00

---

**Optimize your deliveries with Tremma!**  
Download the app: [Play Store](https://) | [App Store](https://)

---

> **Note:** For push notifications, configure Firebase following [the Expo guide](https://docs.expo.dev/push-notifications/overview/)