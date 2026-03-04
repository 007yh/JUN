# GitHub 打包签名发布指南（iOS + Android）

## 1. 先把项目推到 GitHub

在项目目录执行：

```powershell
git init
git add .
git commit -m "init release workflows"
git branch -M main
git remote add origin <你的GitHub仓库地址>
git push -u origin main
```

## 2. 配置 GitHub Secrets

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 新增：

### Android
- `ANDROID_KEYSTORE_BASE64`: `release.keystore` 的 base64
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

### iOS
- `IOS_DIST_CERT_BASE64`: iOS 分发证书 `.p12` 的 base64
- `IOS_DIST_CERT_PASSWORD`
- `IOS_PROFILE_BASE64`: `mobileprovision` 的 base64
- `IOS_KEYCHAIN_PASSWORD`: 任意强密码
- `APPLE_TEAM_ID`

### App Store Connect API
- `APPSTORE_KEY_ID`
- `APPSTORE_ISSUER_ID`
- `APPSTORE_PRIVATE_KEY_BASE64`: `AuthKey_XXXX.p8` 的 base64

## 3. 触发构建

方式 A：在 GitHub Actions 页面手动运行：
- `Android Release`
- `iOS TestFlight`

方式 B：打 tag 自动触发：

```powershell
git tag v1.0.0
git push origin v1.0.0
```

## 4. 安装分发

### Android 用户
- 从 Actions Artifacts 下载 `.apk`（内测）或 `.aab`（Google Play 上架）。

### iOS 用户
- 构建后自动上传 TestFlight。
- 在 App Store Connect 把构建分发给测试人员安装。

## 5. 当前已配置的 CI 文件

- `.github/workflows/android-release.yml`
- `.github/workflows/ios-testflight.yml`

