# frontend/Dockerfile

# -----------------------------------------------------------
# Giai đoạn Build (builder stage) - Tạo bản build sản phẩm Next.js
# -----------------------------------------------------------
FROM node:22 AS builder

WORKDIR /app

# Copy các file cấu hình dependency
COPY package.json package-lock.json ./

# Cài đặt tất cả các dependencies (bao gồm dev dependencies)
RUN npm install

# Copy toàn bộ mã nguồn của dự án Next.js
COPY . .

# Chạy lệnh build của Next.js
# Lệnh này sẽ tạo ra thư mục .next/ chứa bản build optimized
RUN npm run build

# -----------------------------------------------------------
# Giai đoạn Production (runner stage) - Tạo image nhẹ để chạy ứng dụng Next.js
# -----------------------------------------------------------
FROM node:22 AS runner

WORKDIR /app

# Copy chỉ các file package.json và package-lock.json cần thiết cho runtime
COPY --from=builder /app/package.json /app/package-lock.json ./

# Cài đặt chỉ các production dependencies
RUN npm install --omit=dev

# Copy thư mục .next/ (chứa bản build) từ giai đoạn 'builder'
COPY --from=builder /app/.next ./.next

# Nếu bạn có thư mục public (ví dụ: chứa ảnh tĩnh), hãy copy nó
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NEXT_PUBLIC_PAGE_SIZE=12
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
ENV JWT_SECRET=jwtsecret12345

# Mở cổng mà ứng dụng Next.js của bạn sẽ lắng nghe
EXPOSE 3000

# Lệnh để chạy ứng dụng Next.js khi container khởi động
# Đây là cách chuẩn để chạy Next.js app trong production
CMD ["npm", "start"]