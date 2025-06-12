// lib/auth/login.ts
export interface LoginBody {
  email: string
  password: string
}


export const login = async (body: LoginBody) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 👈 BẮT BUỘC để nhận cookie từ server
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Đăng nhập thất bại');
  }

  return res.json();
};

