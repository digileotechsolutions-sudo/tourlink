import { AuthForm } from "@/components/auth-form";
export default function AdminLoginPage() { return <main className="auth-page"><AuthForm mode="login" successPath="/admin" /></main>; }