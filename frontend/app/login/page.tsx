import SignupFormDemo from "../components/Signup-Form";

export default function Login() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <SignupFormDemo login={true} />
    </div>
  );
}
