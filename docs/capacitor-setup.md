# Capacitor Setup for MyNest

Capacitor has been successfully installed and configured for the MyNest React + Vite + TypeScript project.

## ✅ Completed Steps

### 1. Installed Dependencies
```bash
cd frontend
npm install --save-dev @capacitor/core @capacitor/cli
```

### 2. Initialized Capacitor
```bash
npx cap init MyNest com.mynest.app --web-dir=dist
```

### 3. Configuration
- **App Name**: MyNest
- **App ID**: com.mynest.app
- **Web Directory**: dist

## 📁 File Structure

After initialization, your project structure includes:

```
frontend/
├── capacitor.config.ts          # Capacitor configuration
├── package.json                  # Updated with Capacitor scripts
├── dist/                         # Build output (webDir)
├── src/                          # React source code
└── ... (other existing files)
```

## 📝 Configuration File

**`frontend/capacitor.config.ts`** contains:

- App ID and name
- Web directory pointing to `dist`
- Server settings for development (commented out)
- Splash screen plugin configuration
- Android/iOS scheme settings

## 🛠️ Available Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "cap:sync": "npx cap sync",      // Sync web assets to native projects
    "cap:copy": "npx cap copy",      // Copy web assets only
    "cap:update": "npx cap update"   // Update Capacitor dependencies
  }
}
```

## 🚀 Next Steps

### For Development

1. **Build your app**:
   ```bash
   npm run build
   ```

2. **Sync to native projects** (after adding platforms):
   ```bash
   npm run cap:sync
   ```

### For Development with Live Reload

To use the Vite dev server in your mobile app during development:

1. **Uncomment in `capacitor.config.ts`**:
   ```typescript
   server: {
     url: 'http://localhost:5173',
     cleartext: true,
   },
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Sync Capacitor**:
   ```bash
   npm run cap:sync
   ```

4. **Run on device/emulator** (after adding platforms)

**Note:** For iOS, you may need to use your computer's IP address instead of `localhost`:
```typescript
url: 'http://192.168.1.XXX:5173', // Replace with your local IP
```

### Adding Native Platforms

When ready to add iOS/Android platforms:

```bash
# For iOS
npm install @capacitor/ios
npx cap add ios

# For Android
npm install @capacitor/android
npx cap add android
```

Then sync:
```bash
npm run build
npm run cap:sync
```

## 📱 Development Workflow

1. **Make changes** to your React app
2. **Build**: `npm run build`
3. **Sync**: `npm run cap:sync`
4. **Run in native IDE**: 
   - iOS: `npx cap open ios` (opens Xcode)
   - Android: `npx cap open android` (opens Android Studio)

## ⚙️ Configuration Details

### Server Settings

- **Development**: Uncomment `url` and `cleartext` to use Vite dev server
- **Production**: Leave commented to use built files from `dist/`

### Splash Screen

Configured with MyNest brand colors:
- Background: `#F3F1E7` (MyNest background color)
- Auto-hide after 2 seconds
- No spinner

## 🔗 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor CLI Reference](https://capacitorjs.com/docs/cli)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)


