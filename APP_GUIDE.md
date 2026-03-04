# 如何将本项目作为 APP 使用

恭喜！你的项目已经配置好了 APP 支持，你有两种方式将其作为 APP 运行：

## 方案一：PWA (最推荐，无需安装包)

本项目已配置为 **Progressive Web App (PWA)**。这意味着你可以直接通过浏览器将其安装到手机主屏幕，体验和原生 APP 几乎一致（全屏、无地址栏、独立图标）。

**如何使用：**
1. 部署你的网站（例如部署到 Vercel/Netlify）。
2. 在手机浏览器（Safari 或 Chrome）中打开网站。
3. 点击浏览器的分享按钮（iOS）或菜单按钮（Android）。
4. 选择 **"添加到主屏幕" (Add to Home Screen)**。
5. 现在你的桌面上会出现 APP 图标，点击即可像普通 APP 一样运行！

## 方案二：生成 Android APK 安装包

如果你需要一个 `.apk` 文件来安装，本项目也集成了 **Capacitor**，可以直接打包成原生安卓应用。

**前提条件：**
- 电脑上安装了 **Android Studio**。

**打包步骤：**
1. 确保你已经构建了最新的 Web 资源：
   ```bash
   npm run build
   ```
2. 同步资源到 Android 项目：
   ```bash
   npx cap sync
   ```
3. 打开 Android 项目：
   ```bash
   npx cap open android
   ```
   这会自动启动 Android Studio。
4. 在 Android Studio 中，等待 Gradle 同步完成。
5. 点击顶部菜单的 **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**。
6. 打包完成后，你就可以得到一个 apk 文件安装到手机上了。

## 关于图标
目前 APP 使用的是默认图标。如果你想换成自己的图标：
1. 准备一张 `1024x1024` 的 `icon.png`。
2. 推荐使用 `capacitor-assets` 工具自动生成所有尺寸的图标。
