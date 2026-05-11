import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      client_id={params.client_id || ""}
      redirect_uri={params.redirect_uri || ""}
      state={params.state || ""}
      code_challenge={params.code_challenge || ""}
      code_challenge_method={params.code_challenge_method || ""}
    />
  );
}