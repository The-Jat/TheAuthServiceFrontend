import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      client_id={params.client_id || ""}
      redirect_uri={params.redirect_uri || ""}
      state={params.state || ""}
    />
  );
}