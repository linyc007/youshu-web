import { redirect } from "next/navigation";

export default function Home() {
  // 自动将根路径重定向到 dashboard 页面
  redirect("/dashboard");
}
