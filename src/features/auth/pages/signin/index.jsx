import Login from "../../components/signin";
import RightSide from "../../components/signin/RightSide";

function SignIn() {
  return (
    <section className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 dark:bg-darkblack-500">
      <div className="flex flex-col lg:flex-row min-h-screen items-stretch gap-0 animate-fade-in-up" style={{ willChange: 'opacity, transform' }}>
        <div className="w-full lg:w-2/3 motion-reduce:translate-x-0 motion-reduce:opacity-100 lg:animate-fade-in-up lg:translate-x-0 lg:opacity-100 lg:motion-safe:animate-fade-in-up">
          <div className="lg:motion-safe:animate-fade-in-up lg:motion-safe:duration-700 lg:motion-safe:delay-150">
            <Login />
          </div>
        </div>
        <div className="w-full lg:w-1/3 motion-reduce:translate-x-0 motion-reduce:opacity-100">
          <div className="lg:motion-safe:animate-fade-in-up lg:motion-safe:duration-700 lg:motion-safe:delay-350">
            <RightSide />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
