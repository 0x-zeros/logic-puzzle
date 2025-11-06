# GitHub Pages 自动部署指南

## 🚀 3步发布到互联网

### 步骤1：推送代码到GitHub

```bash
# 如果还没有GitHub仓库
git remote add origin https://github.com/你的用户名/logic-puzzle.git

# 提交所有更改
git add .
git commit -m "Add GitHub Pages auto deploy"
git push -u origin main
```

### 步骤2：启用GitHub Pages

1. 进入GitHub仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单点击 **Pages**
4. **Source** 选择：**GitHub Actions**
5. 完成！

### 步骤3：等待构建完成

1. 进入 **Actions** 标签页
2. 看到 "Deploy to GitHub Pages" 工作流运行中
3. 等待5-10分钟（首次较慢）
4. 构建成功后，访问：

```
https://你的用户名.github.io/logic-puzzle/
```

---

## 🎉 完成！

现在每次推送代码，都会自动：
1. 编译WASM
2. 构建React前端
3. 部署到GitHub Pages
4. 5-10分钟后更新生效

---

## 📱 分享给朋友

直接发送链接：
```
https://你的用户名.github.io/logic-puzzle/
```

**支持设备**：
- ✅ PC浏览器（Chrome、Firefox、Safari、Edge）
- ✅ 手机浏览器（iOS、Android）
- ✅ 平板浏览器

---

## 🔧 自定义域名（可选）

### 使用GitHub提供的域名
```
https://你的用户名.github.io/logic-puzzle/
```

### 使用自己的域名

1. 在仓库根目录创建 `public/CNAME` 文件：
   ```
   yourdomain.com
   ```

2. 在域名DNS设置添加CNAME记录：
   ```
   CNAME  @  你的用户名.github.io
   ```

3. GitHub Pages设置中输入自定义域名

4. 等待DNS生效（几分钟到几小时）

---

## 🛠️ 构建优化（已配置）

**已包含**：
- ✅ Cargo缓存（加快Rust编译）
- ✅ npm缓存（加快依赖安装）
- ✅ WASM优化编译（--release）
- ✅ Vite生产构建

**构建时间**：
- 首次：8-10分钟
- 后续：3-5分钟（有缓存）

---

## 📊 工作流程图

```
git push
  ↓
GitHub Actions触发
  ↓
┌─────────────────────┐
│ 1. 安装Rust环境     │ (1分钟)
│ 2. 编译WASM         │ (2-3分钟)
│ 3. 安装Node.js      │ (30秒)
│ 4. 构建React前端    │ (1分钟)
│ 5. 部署到Pages      │ (30秒)
└─────────────────────┘
  ↓
完成！
访问: https://你的用户名.github.io/logic-puzzle/
```

---

## 🎯 验证部署成功

### 检查构建状态

1. GitHub仓库 → **Actions** 标签
2. 查看最新的workflow运行
3. 绿色✅ = 成功
4. 红色❌ = 失败（点击查看日志）

### 测试网站

```bash
# 打开部署的网站
open https://你的用户名.github.io/logic-puzzle/
```

**预期效果**：
- ✅ 页面加载（1-2秒）
- ✅ 控制台显示：`🌐 检测到Web环境，使用WASM版本`
- ✅ 控制台显示：`✅ WASM模块初始化成功`
- ✅ 自动生成关卡
- ✅ 游戏正常运行

---

## 📝 常见问题

### Q: 404 Not Found
A: 检查vite.config.ts的base路径是否与仓库名匹配

### Q: WASM加载失败
A: 检查Actions构建日志，确认WASM编译成功

### Q: 如何手动触发部署？
A: GitHub仓库 → Actions → Deploy to GitHub Pages → Run workflow

---

## 🎊 现在就可以发布了！

**一键发布**：
```bash
git add .
git commit -m "🚀 Deploy to GitHub Pages"
git push
```

等待5-10分钟，你的游戏就在线上了！

---

**文档创建时间**: 2025-11-06
**难度**: ⭐（非常简单）
**时间**: 15-20分钟
