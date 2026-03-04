# 🍎🤖 双端数据同步指南 (Supabase 方案)

为了实现苹果 (iOS PWA) 和安卓 (Android APP) 的数据同步，我们需要一个云端数据库。我们选择 **Supabase**，因为它：
1.  **免费** (Free Tier 足够个人使用)
2.  **无需维护服务器**
3.  **配置简单**

## 第一步：获取 Supabase URL 和 Key

1.  访问 [supabase.com](https://supabase.com/) 并注册账号。
2.  点击 **"New Project"** 创建一个新项目 (名称随意，例如 `LoveSpace`)。
3.  等待数据库初始化完成 (约 1-2 分钟)。
4.  进入 **Project Settings** (左下角齿轮图标) -> **API**。
5.  复制以下两个值：
    *   **Project URL**
    *   **anon public** (API Key)

## 第二步：创建数据表

1.  点击左侧菜单的 **SQL Editor**。
2.  点击 **New Query**，粘贴以下 SQL 代码并点击 **Run**：

```sql
-- 创建存储空间数据的表
create table if not exists couple_spaces (
  code text primary key, -- 邀请码作为唯一标识 (如 CJYH2026)
  data jsonb,            -- 存储所有应用数据
  updated_at timestamp with time zone default timezone('utc', now())
);

-- 开启行级安全策略 (RLS) - 简单起见，允许所有人读写 (仅靠邀请码隔离)
alter table couple_spaces enable row level security;

create policy "Enable all access for now" 
on couple_spaces for all 
using (true) 
with check (true);

-- (可选) 如果需要存储图片，还需要创建 Storage Bucket
insert into storage.buckets (id, name, public) values ('couple_photos', 'couple_photos', true);

create policy "Public Access" 
on storage.objects for all 
using ( bucket_id = 'couple_photos' );
```

## 第三步：配置项目

在你的项目根目录下，找到 `.env.local` 文件 (如果没有则创建)，填入第一步获取的信息：

```env
VITE_SUPABASE_URL=你的ProjectURL
VITE_SUPABASE_ANON_KEY=你的AnonKey
```

**注意**：
*   对于 **Android 打包**：这些变量需要配置在构建环境中，或者直接硬编码到 `src/lib/supabase.ts` 中 (仅限个人使用，不推荐用于开源项目)。
*   为了方便，我会在代码中提供一个 "设置入口"，让你可以在 APP 界面里直接输入这些 Key (如果你不想重新打包)。

## 第四步：重新打包/部署

1.  **Web/PWA**: 重新部署你的网站。
2.  **Android**: 重新运行 `npm run build && npx cap sync` 并打包 APK。

完成以上步骤后，无论你在苹果还是安卓上，只要使用**同一个邀请码 (CJYH2026)** 进入，数据就会自动同步！
